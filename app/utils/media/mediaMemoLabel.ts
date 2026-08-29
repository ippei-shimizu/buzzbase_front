import type { MediaType } from "@app/interface/mediaAttachmentV2";

const MEMO_PREVIEW_MAX_LENGTH = 14;

/**
 * サムネイル上に重ねるメモ状況ラベル。未記入なら記入を促す文言、
 * 記入済みならその内容のプレビューを返す（mobile の buildMediaMemoLabel と同じ表記）。
 */
export function buildMediaMemoLabel(
  mediaType: MediaType,
  memo: string | null | undefined,
): string {
  const trimmed = memo?.trim() ?? "";
  if (trimmed.length > 0) {
    return trimmed.length > MEMO_PREVIEW_MAX_LENGTH
      ? `${trimmed.slice(0, MEMO_PREVIEW_MAX_LENGTH)}…`
      : trimmed;
  }
  return `${mediaType === "video" ? "動画" : "画像"}にメモを記入`;
}
