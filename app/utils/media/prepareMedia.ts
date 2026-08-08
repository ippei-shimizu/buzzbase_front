import type { PreparedMedia } from "./uploadPipeline";
import { resolveMediaKind } from "./mediaFile";
import {
  longEdge,
  mediaLimitsFor,
  validateImageSize,
  validateVideoMeta,
} from "./mediaLimits";
import {
  captureVideoThumbnail,
  processImage,
  readVideoMeta,
} from "./mediaProcessing";
import { isVideoResizeSupported, resizeVideoToLongEdge } from "./videoResize";

export type PrepareMediaResult =
  | { ok: true; prepared: PreparedMedia }
  | { ok: false; message: string };

const UNSUPPORTED_MESSAGE =
  "対応していない形式です。JPEG / PNG / HEIC の画像、MP4 / MOV の動画を選んでください。";

/**
 * 選択されたファイルを、そのままアップロードできる形まで整える。
 *
 * 画像は canvas で縮小して JPEG に揃える。HEIC のように canvas がデコードできない
 * 形式では縮小できないため、元ファイルのまま送って上限判定に委ねる。
 * 動画はブラウザで再エンコードする手段を持たないため、上限を超えていればここで弾く。
 */
export async function prepareMediaFile(
  file: File,
  isPro: boolean,
): Promise<PrepareMediaResult> {
  const kind = resolveMediaKind(file.type);
  if (!kind) return { ok: false, message: UNSUPPORTED_MESSAGE };

  return kind.mediaType === "image"
    ? prepareImage(file, kind.contentType, isPro)
    : prepareVideo(file, kind.contentType, isPro);
}

async function prepareImage(
  file: File,
  contentType: string,
  isPro: boolean,
): Promise<PrepareMediaResult> {
  let prepared: PreparedMedia;
  try {
    const processed = await processImage(file);
    prepared = {
      mediaType: "image",
      contentType: processed.contentType,
      file: processed.blob,
      thumbnail: null,
      width: processed.width,
      height: processed.height,
    };
  } catch {
    prepared = {
      mediaType: "image",
      contentType,
      file,
      thumbnail: null,
    };
  }

  const sizeError = validateImageSize(prepared.file.size, isPro);
  if (sizeError) return { ok: false, message: sizeError };

  return { ok: true, prepared };
}

async function prepareVideo(
  file: File,
  contentType: string,
  isPro: boolean,
): Promise<PrepareMediaResult> {
  let meta;
  try {
    meta = await readVideoMeta(file);
  } catch {
    return {
      ok: false,
      message:
        "動画を読み込めませんでした。MP4 / MOV 形式の動画を選んでください。",
    };
  }

  const { videoMaxDurationSeconds, videoMaxHeight } = mediaLimitsFor(isPro);
  const durationExceeded = meta.durationSeconds > videoMaxDurationSeconds;
  const resolutionExceeded = longEdge(meta) > videoMaxHeight;

  let resultFile: Blob = file;
  let resultContentType = contentType;

  // 長さは収まっているが解像度だけ超過している場合のみリサイズで救える可能性がある。
  // 長さの超過はリサイズでは解決しないため試みない。
  if (!durationExceeded && resolutionExceeded && isVideoResizeSupported()) {
    try {
      const resized = await resizeVideoToLongEdge(file, meta, videoMaxHeight);
      if (!validateVideoMeta(resized.meta, isPro)) {
        meta = resized.meta;
        resultFile = resized.file;
        resultContentType = resized.contentType;
      }
    } catch {
      // 非対応環境や変換失敗時は元ファイルのバリデーション結果に委ねる（下のエラーで弾かれる）。
    }
  }

  const metaError = validateVideoMeta(meta, isPro);
  if (metaError) return { ok: false, message: metaError };

  return {
    ok: true,
    prepared: {
      mediaType: "video",
      contentType: resultContentType,
      file: resultFile,
      thumbnail: await captureVideoThumbnail(resultFile),
      durationSeconds: meta.durationSeconds,
      width: meta.width,
      height: meta.height,
    },
  };
}
