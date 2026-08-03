import type { PreparedMedia } from "./uploadPipeline";
import { resolveMediaKind } from "./mediaFile";
import { validateImageSize, validateVideoMeta } from "./mediaLimits";
import {
  captureVideoThumbnail,
  processImage,
  readVideoMeta,
} from "./mediaProcessing";

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

  const metaError = validateVideoMeta(meta, isPro);
  if (metaError) return { ok: false, message: metaError };

  return {
    ok: true,
    prepared: {
      mediaType: "video",
      contentType,
      file,
      thumbnail: await captureVideoThumbnail(file),
      durationSeconds: meta.durationSeconds,
      width: meta.width,
      height: meta.height,
    },
  };
}
