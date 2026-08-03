// back/app/models/concerns/plan_limits.rb の MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH と一致させる。
// 表示・文言用の参考値であり、この値でアップロードをブロックしてはならない。
// 保有 entitlement はグランドファザリングで無料ユーザーにも付きうるため、
// 可否の判定は必ず back の 403 に委ねる。
export const MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH = 3;

// back/app/services/media_attachments/limit_validator.rb と同じ境界値。
// サーバー検証の代わりではなく、無駄なアップロードを事前に止めるための事前チェック用。
export const FREE_VIDEO_MAX_DURATION_SECONDS = 30;
export const PRO_VIDEO_MAX_DURATION_SECONDS = 180;
export const FREE_VIDEO_MAX_HEIGHT = 480;
export const PRO_VIDEO_MAX_HEIGHT = 1080;
export const FREE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRO_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

// back/app/services/media_attachments/presigned_url_service.rb の PUT_EXPIRES_IN（10分）。
export const PRESIGN_URL_TTL_MS = 10 * 60 * 1000;

/**
 * 署名URLを「期限切れ間近」とみなす余裕。
 * PUT の開始時点で残りがこれ未満なら、送信中に期限を跨ぐ可能性が高いため取り直す。
 */
export const PRESIGN_URL_SAFETY_MARGIN_MS = 60 * 1000;

/**
 * back の Api::V2::MediaAttachments::PresignsController が受け付ける content_type。
 * ここに無い形式は presign が 422 を返すため、選択時点で弾く。
 */
export const SUPPORTED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
] as const;

export const SUPPORTED_VIDEO_CONTENT_TYPES = [
  "video/mp4",
  "video/quicktime",
] as const;

/** 画像をブラウザ側で縮小するときの長辺の目安（R2 の保存コスト対策）。 */
export const IMAGE_RESIZE_MAX_EDGE = 1080;

/** 縮小後の JPEG 品質。 */
export const IMAGE_RESIZE_QUALITY = 0.8;
