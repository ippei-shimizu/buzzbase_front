import type { MediaType } from "@app/interface/mediaAttachmentV2";
import {
  SUPPORTED_IMAGE_CONTENT_TYPES,
  SUPPORTED_VIDEO_CONTENT_TYPES,
} from "@app/constants/mediaAttachment";

export interface SelectedMediaKind {
  mediaType: MediaType;
  contentType: string;
}

/**
 * 選択されたファイルの MIME から media_type / content_type を決める。
 *
 * back は media_type と content_type の組み合わせを許可リストで検証する
 * （画像に動画の content_type を渡して動画の長さチェックを回避されるのを防ぐため）。
 * 対応外の形式は presign が 422 を返すので、ここで先に弾く。
 *
 * @returns 対応形式なら種別、対応外なら null
 */
export function resolveMediaKind(
  contentType: string,
): SelectedMediaKind | null {
  const normalized = contentType.toLowerCase().split(";")[0].trim();

  if ((SUPPORTED_IMAGE_CONTENT_TYPES as readonly string[]).includes(normalized))
    return { mediaType: "image", contentType: normalized };

  if ((SUPPORTED_VIDEO_CONTENT_TYPES as readonly string[]).includes(normalized))
    return { mediaType: "video", contentType: normalized };

  return null;
}

/** ファイル選択ダイアログに渡す accept 属性。対応形式だけを最初から見せる。 */
export const MEDIA_ACCEPT_ATTRIBUTE = [
  ...SUPPORTED_IMAGE_CONTENT_TYPES,
  ...SUPPORTED_VIDEO_CONTENT_TYPES,
].join(",");

/**
 * 縮小後の描画サイズ。長辺が maxEdge を超える場合だけ縦横比を保って縮める。
 * 拡大はしない（元より大きくしても画質は上がらず容量だけ増えるため）。
 */
export function computeResizeTarget(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxEdge || longestEdge === 0) return { width, height };

  const scale = maxEdge / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** ステージ中メディアの一意キー。同一ファイルを続けて選んでも衝突しない程度の粒度で足りる。 */
export function buildStagedLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
