import {
  FREE_IMAGE_MAX_BYTES,
  FREE_VIDEO_MAX_DURATION_SECONDS,
  FREE_VIDEO_MAX_HEIGHT,
  PRESIGN_URL_SAFETY_MARGIN_MS,
  PRESIGN_URL_TTL_MS,
  PRO_IMAGE_MAX_BYTES,
  PRO_VIDEO_MAX_DURATION_SECONDS,
  PRO_VIDEO_MAX_HEIGHT,
} from "@app/constants/mediaAttachment";

export interface MediaLimits {
  videoMaxDurationSeconds: number;
  videoMaxHeight: number;
  imageMaxBytes: number;
}

/**
 * プランごとの上限値。back の MediaAttachments::LimitValidator と同じ境界で判定する。
 *
 * これはサーバー検証の代わりではない。back は完了通知時に R2 上の実サイズで再検証するため、
 * ここを通ってもサーバーに落とされることはある（逆にここで落とすものはサーバーでも必ず落ちる）。
 */
export function mediaLimitsFor(isPro: boolean): MediaLimits {
  return {
    videoMaxDurationSeconds: isPro
      ? PRO_VIDEO_MAX_DURATION_SECONDS
      : FREE_VIDEO_MAX_DURATION_SECONDS,
    videoMaxHeight: isPro ? PRO_VIDEO_MAX_HEIGHT : FREE_VIDEO_MAX_HEIGHT,
    imageMaxBytes: isPro ? PRO_IMAGE_MAX_BYTES : FREE_IMAGE_MAX_BYTES,
  };
}

function toMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(0);
}

/**
 * 画像がプランの上限に収まるか。収まらなければ表示用のメッセージを返す。
 *
 * 縮小後のサイズで判定すること。back は R2 上の実サイズで検証するため、
 * 元ファイルのサイズで弾くと縮小すれば通るものまで拒否してしまう。
 */
export function validateImageSize(
  sizeBytes: number,
  isPro: boolean,
): string | null {
  const { imageMaxBytes } = mediaLimitsFor(isPro);
  if (sizeBytes <= imageMaxBytes) return null;

  const limit = `${toMegabytes(imageMaxBytes)}MB`;
  return isPro
    ? `画像は${limit}以内にしてください。`
    : `画像は${limit}以内にしてください（Pro プランなら${toMegabytes(PRO_IMAGE_MAX_BYTES)}MB まで）。`;
}

export interface VideoMeta {
  durationSeconds: number;
  width: number;
  height: number;
}

/**
 * 動画がプランの上限に収まるか。収まらなければ表示用のメッセージを返す。
 *
 * ブラウザには動画のトリミング・再エンコード手段を持たせていないため、超過した動画は
 * 選択の時点で弾く。アップロードしても back の LimitValidator が必ず 422 を返し、
 * 通信時間だけ消費して `failed` レコードが増えるだけになるため。
 */
export function validateVideoMeta(
  meta: VideoMeta,
  isPro: boolean,
): string | null {
  const { videoMaxDurationSeconds, videoMaxHeight } = mediaLimitsFor(isPro);

  if (meta.durationSeconds > videoMaxDurationSeconds) {
    return isPro
      ? `動画は${videoMaxDurationSeconds}秒以内にしてください。`
      : `動画は${videoMaxDurationSeconds}秒以内にしてください（Pro プランなら${PRO_VIDEO_MAX_DURATION_SECONDS}秒まで）。`;
  }

  if (meta.height > videoMaxHeight) {
    return isPro
      ? `動画の縦解像度は${videoMaxHeight}px 以内にしてください。`
      : `動画の縦解像度は${videoMaxHeight}px 以内にしてください（Pro プランなら${PRO_VIDEO_MAX_HEIGHT}px まで）。`;
  }

  return null;
}

/**
 * 署名 URL が期限切れ、または送信中に期限を跨ぎそうか。
 *
 * back の有効期限は10分。判定に余裕（PRESIGN_URL_SAFETY_MARGIN_MS）を持たせるのは、
 * PUT の途中で失効すると R2 側が 403 を返し、アップロードし直しになるため。
 *
 * @param issuedAtMs presign が返ってきた時刻（epoch ミリ秒）
 * @param nowMs 判定時刻（epoch ミリ秒）
 */
export function isPresignExpiring(issuedAtMs: number, nowMs: number): boolean {
  return (
    nowMs - issuedAtMs >= PRESIGN_URL_TTL_MS - PRESIGN_URL_SAFETY_MARGIN_MS
  );
}

/**
 * R2 への PUT が「署名 URL の失効」で失敗したか。
 * S3 互換の署名失効は 403、稀に前段のプロキシが 401 を返すため両方を失効として扱い、
 * 一度だけ presign し直す判断に使う。
 */
export function isExpiredUploadStatus(status: number): boolean {
  return status === 401 || status === 403;
}
