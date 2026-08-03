import type { VideoMeta } from "./mediaLimits";
import {
  IMAGE_RESIZE_MAX_EDGE,
  IMAGE_RESIZE_QUALITY,
} from "@app/constants/mediaAttachment";
import { computeResizeTarget } from "./mediaFile";

// メタ読み込み・シークがブラウザ側で返ってこないまま固まるケースの安全網。
const VIDEO_TIMEOUT_MS = 15_000;
const IMAGE_TIMEOUT_MS = 15_000;
// サムネイルは 0 秒だと黒フレームになりやすいので、わずかに進めた位置を切り出す。
const THUMBNAIL_SEEK_SECONDS = 0.1;
const THUMBNAIL_MAX_EDGE = 640;

export interface ProcessedImage {
  blob: Blob;
  contentType: string;
  width: number;
  height: number;
}

function withTimeout<T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason: Error) => void,
  ) => void,
  timeoutMs: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    const settle =
      <A extends unknown[]>(handler: (...args: A) => void) =>
      (...args: A) => {
        clearTimeout(timer);
        handler(...args);
      };
    executor(settle(resolve), settle(reject));
  });
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("canvas を利用できません"));
  context.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("画像の変換に失敗しました")),
      "image/jpeg",
      quality,
    );
  });
}

/**
 * 画像をブラウザ側で縮小し、JPEG として書き出す。
 *
 * R2 の保存コストを抑えるだけでなく、無料プランの5MB上限に収める役割も持つ。
 * HEIC のように canvas がデコードできない形式では失敗するため、呼び出し側は
 * 元ファイルのまま送るフォールバックを用意すること。
 */
export async function processImage(
  file: Blob,
  maxEdge: number = IMAGE_RESIZE_MAX_EDGE,
  quality: number = IMAGE_RESIZE_QUALITY,
): Promise<ProcessedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await withTimeout<HTMLImageElement>(
      (resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("画像を読み込めませんでした"));
        element.src = objectUrl;
      },
      IMAGE_TIMEOUT_MS,
      "画像の読み込みがタイムアウトしました",
    );

    const target = computeResizeTarget(
      image.naturalWidth,
      image.naturalHeight,
      maxEdge,
    );
    const blob = await drawToCanvas(
      image,
      target.width,
      target.height,
      quality,
    );
    return {
      blob,
      contentType: "image/jpeg",
      width: target.width,
      height: target.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadVideoElement(objectUrl: string): Promise<HTMLVideoElement> {
  return withTimeout<HTMLVideoElement>(
    (resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      // 自動再生ポリシーに関係なくデコードを進めるため、常にミュートで扱う。
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => resolve(video);
      video.onerror = () => reject(new Error("動画を読み込めませんでした"));
      video.src = objectUrl;
    },
    VIDEO_TIMEOUT_MS,
    "動画情報の取得がタイムアウトしました",
  );
}

/** 動画の長さ・解像度を読む。上限チェックとアップロード完了通知の両方で使う。 */
export async function readVideoMeta(file: Blob): Promise<VideoMeta> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = await loadVideoElement(objectUrl);
    return {
      durationSeconds: Number.isFinite(video.duration)
        ? Math.round(video.duration)
        : 0,
      width: video.videoWidth,
      height: video.videoHeight,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * 動画の先頭付近のフレームからサムネイル（JPEG）を作る。
 * サムネイルが無くても本体のアップロードは成立するため、失敗時は null を返す。
 */
export async function captureVideoThumbnail(file: Blob): Promise<Blob | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = await loadVideoElement(objectUrl);
    await withTimeout<void>(
      (resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("シークに失敗しました"));
        video.currentTime = Math.min(
          THUMBNAIL_SEEK_SECONDS,
          Number.isFinite(video.duration) ? video.duration / 2 : 0,
        );
      },
      VIDEO_TIMEOUT_MS,
      "サムネイル生成がタイムアウトしました",
    );

    const target = computeResizeTarget(
      video.videoWidth,
      video.videoHeight,
      THUMBNAIL_MAX_EDGE,
    );
    return await drawToCanvas(
      video,
      target.width,
      target.height,
      IMAGE_RESIZE_QUALITY,
    );
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
