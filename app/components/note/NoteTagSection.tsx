"use client";

import type { NoteTag } from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import { useState } from "react";
import { ProUpsellOverlay } from "@app/components/pro/ProUpsellOverlay";
import { createNoteTag } from "@app/services/v2/noteTagService";
import { normalizeTagName, tagLabel } from "@app/utils/noteTags";

interface NoteTagSectionProps {
  /** タグ一覧の取得結果。失敗を空配列に丸めるとタグ未登録と誤表示するため結果ごと受け取る。 */
  tagsResult: FetchResult<NoteTag[]>;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /**
   * タグを編集できるか（`note_tags` entitlement を持ち、かつ Pro 判定が確定している）。
   * false の間は操作させない。呼び出し側は同じ値で `tag_ids` の送信可否も決めること。
   */
  canEdit: boolean;
}

const MAX_TAG_NAME_LENGTH = 20;

/**
 * ノートのタグ選択。運営プリセット＋自作タグをトグルチップで複数選択でき、
 * 未登録の名前はその場で作成して選択に加える（mobile の TagSection と同じ操作感）。
 *
 * 表示は `#` 付き、保存名には `#` を含めない。無料ユーザーには ProUpsellOverlay で
 * 覆ったプレビューを見せる（暗幕側で inert になるため操作はできない）。
 */
export default function NoteTagSection({
  tagsResult,
  selectedIds,
  onChange,
  canEdit,
}: NoteTagSectionProps) {
  // 作成したタグは一覧の再取得なしにその場で選べるようにするため手元に足す。
  const [createdTags, setCreatedTags] = useState<NoteTag[]>([]);
  const [draftName, setDraftName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchedTags = tagsResult.status === "ok" ? tagsResult.data : null;
  const tags = fetchedTags === null ? null : [...fetchedTags, ...createdTags];

  const toggle = (id: number) => {
    if (!canEdit) return;
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id],
    );
  };

  const handleCreate = async () => {
    if (!canEdit || isCreating) return;
    const name = normalizeTagName(draftName);
    if (name === "") return;

    // 同名が既にあれば作成せず選択に加えるだけ（back の一意制約で 422 になるのを避ける）。
    const existing = tags?.find((tag) => tag.name === name);
    if (existing) {
      if (!selectedIds.includes(existing.id))
        onChange([...selectedIds, existing.id]);
      setDraftName("");
      setCreateError(null);
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    const result = await createNoteTag({ name });
    setIsCreating(false);
    if (!result.ok) {
      // 入力はそのまま残す。作り直しのために打ち直させない。
      setCreateError(result.errors[0] ?? "タグの作成に失敗しました");
      return;
    }
    setCreatedTags((prev) => [...prev, result.data]);
    onChange([...selectedIds, result.data.id]);
    setDraftName("");
  };

  return (
    <section aria-labelledby="note-tag-section-heading" className="mt-8">
      <h3
        id="note-tag-section-heading"
        className="text-sm font-bold text-zinc-400"
      >
        タグ（任意・複数選択可）
      </h3>
      <ProUpsellOverlay
        feature="note_tags"
        lockedIndicator="badge"
        className="mt-2"
      >
        {tags === null ? (
          <p className="text-xs text-zinc-400">
            タグを取得できませんでした。メモはそのまま入力できます。
          </p>
        ) : (
          <>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="タグ"
            >
              {tags.length === 0 ? (
                <p className="text-xs text-zinc-400">
                  タグがまだありません。下の入力欄から作成できます。
                </p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={selectedIds.includes(tag.id)}
                    onClick={() => toggle(tag.id)}
                    className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                      selectedIds.includes(tag.id)
                        ? "bg-[#d08000] text-white"
                        : "bg-sub text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tagLabel(tag.name)}
                  </button>
                ))
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                aria-label="新しいタグ"
                placeholder="新しいタグを追加"
                maxLength={MAX_TAG_NAME_LENGTH + 1}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  // ノート保存フォームの中にあるため Enter で submit させない。
                  event.preventDefault();
                  void handleCreate();
                }}
                className="min-w-0 flex-1 rounded-lg bg-sub px-3 py-2 text-sm text-white placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={normalizeTagName(draftName) === "" || isCreating}
                className="shrink-0 rounded-lg bg-[#d08000] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                追加
              </button>
            </div>
            {createError ? (
              <p role="alert" className="mt-2 text-xs text-red-400">
                {createError}
              </p>
            ) : null}
          </>
        )}
      </ProUpsellOverlay>
    </section>
  );
}
