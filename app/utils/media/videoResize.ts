import type { VideoMeta } from "./mediaLimits";
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Mp4OutputFormat,
  Input,
  Output,
} from "mediabunny";
import { readVideoMeta } from "./mediaProcessing";

// 変換が返ってこないまま固まるケースの安全網。大きめの動画でも現実的な時間で頭打ちにする。
const CONVERSION_TIMEOUT_MS = 60_000;

/**
 * ブラウザが動画のデコード・エンコードに対応しているか。
 * 非対応環境（旧 Safari / 旧 Firefox 等）では自動リサイズをスキップし、
 * 呼び出し側は選択時点のバリデーションで弾くフォールバックに委ねる。
 */
export function isVideoResizeSupported(): boolean {
  return (
    typeof VideoEncoder !== "undefined" && typeof VideoDecoder !== "undefined"
  );
}

export interface ResizedVideo {
  file: Blob;
  contentType: string;
  meta: VideoMeta;
}

/**
 * 動画の長辺（横持ちなら width、縦持ちなら height）を maxLongEdge px まで縮小し、
 * 映像・音声両方を保持したまま MP4 として書き出す。
 *
 * mediabunny（WebCodecs ベース）を使う。対応していない環境や変換に失敗した場合は
 * 例外を投げるので、呼び出し側は必ず try/catch し、元ファイルでの選択時点バリデーションに
 * フォールバックすること（このプロジェクトはサーバー側で動画を再エンコードしないため、
 * ここで失敗した動画は最終的に back の LimitValidator でも弾かれる）。
 *
 * @param options.signal 呼び出し元がユーザー操作等で中断したいときの合図。
 *   中断時・タイムアウト時は mediabunny の Conversion#cancel() で変換を止め、
 *   execute() を ConversionCanceledError で終わらせる。
 */
export async function resizeVideoToLongEdge(
  file: File,
  meta: VideoMeta,
  maxLongEdge: number,
  options?: { signal?: AbortSignal },
): Promise<ResizedVideo> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  const isLandscape = meta.width >= meta.height;
  const conversion = await Conversion.init({
    input,
    output,
    video: isLandscape ? { width: maxLongEdge } : { height: maxLongEdge },
  });
  if (!conversion.isValid) {
    throw new Error("この動画は変換できません");
  }

  const signal = options?.signal;
  if (signal?.aborted) {
    await conversion.cancel();
    throw new DOMException("動画の変換が中断されました", "AbortError");
  }

  const handleAbort = () => void conversion.cancel();
  signal?.addEventListener("abort", handleAbort);
  const timeoutId = setTimeout(
    () => void conversion.cancel(),
    CONVERSION_TIMEOUT_MS,
  );

  try {
    await conversion.execute();
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", handleAbort);
  }

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("動画の変換に失敗しました");

  const resizedFile = new Blob([buffer], { type: "video/mp4" });
  return {
    file: resizedFile,
    contentType: "video/mp4",
    meta: await readVideoMeta(resizedFile),
  };
}
