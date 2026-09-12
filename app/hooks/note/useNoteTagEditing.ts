"use client";

import { useEntitlement } from "@app/hooks/pro/useEntitlement";

interface UseNoteTagEditingReturn {
  /**
   * タグを編集して送信してよいか。
   * Pro 判定が未確定の間は false のままにする。未確定を「編集できる」と扱うと、
   * 判定確定前に保存したノートへ `tag_ids` を送ってしまい、back 側で既存タグが消える。
   */
  canEditTags: boolean;
  /** Pro 判定が未確定の間だけ true。 */
  isLoading: boolean;
}

/** 野球ノートのタグ編集可否（`note_tags` entitlement）。 */
export function useNoteTagEditing(): UseNoteTagEditingReturn {
  const { hasEntitlement, isLoading } = useEntitlement();

  return {
    canEditTags: !isLoading && hasEntitlement("note_tags"),
    isLoading,
  };
}
