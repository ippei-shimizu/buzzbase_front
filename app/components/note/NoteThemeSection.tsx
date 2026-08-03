"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import { useState } from "react";
import { themeCategoryLabel } from "@app/constants/improvementTheme";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { canLinkMore } from "@app/utils/noteLinks";

interface NoteThemeSectionProps {
  /**
   * 課題一覧の取得結果。失敗を空配列に丸めると「課題未設定」と誤表示するため結果ごと受け取る。
   * 選択候補は取組中（open）のみに絞るが、既に紐付いている克服済みの課題も名前を出すため
   * 全ステータスを渡すこと。
   */
  themesResult: FetchResult<ImprovementTheme[]>;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /**
   * 更新前にノートへ紐付いていた件数（新規作成は 0）。
   * back のグランドファザリング（既存件数以下なら無料でも維持できる）に合わせるために必要。
   */
  initialCount: number;
}

/**
 * ノートに紐付ける課題のピッカー（mobile の ThemePickerField 相当）。
 *
 * 複数紐付けは Pro 限定だが、無料判定は「1件まで」と決め打ちしない。
 * back は既存件数を超えて増やすときだけ弾くため、既存の複数紐付けはそのまま維持できる。
 */
export default function NoteThemeSection({
  themesResult,
  selectedIds,
  onChange,
  initialCount,
}: NoteThemeSectionProps) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const { hasEntitlement, isLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const themes = themesResult.status === "ok" ? themesResult.data : null;
  const selectedThemes = selectedIds.map((id) => ({
    id,
    theme: themes?.find((item) => item.id === id) ?? null,
  }));
  const selectableThemes = (themes ?? []).filter(
    (theme) => theme.status === "open" && !selectedIds.includes(theme.id),
  );

  const handleOpenPicker = () => {
    if (
      !canLinkMore({
        nextCount: selectedIds.length + 1,
        initialCount,
        // Pro 判定が未確定の間は権利なしとして扱う（確定後に開き直せる）。
        hasMultiLink:
          !isLoading && hasEntitlement("multi_improvement_theme_links"),
      })
    ) {
      openProUpgradeModal({ trigger: "multi_improvement_theme_links" });
      return;
    }
    setPickerOpen((prev) => !prev);
  };

  const handleSelect = (id: number) => {
    onChange([...selectedIds, id]);
    setPickerOpen(false);
  };

  const handleRemove = (id: number) =>
    onChange(selectedIds.filter((selected) => selected !== id));

  return (
    <section aria-labelledby="note-theme-section-heading" className="mt-8">
      <h3
        id="note-theme-section-heading"
        className="text-sm font-bold text-zinc-400"
      >
        取り組む課題（任意）
      </h3>

      {themes === null ? (
        <p className="mt-2 text-xs text-zinc-400">
          課題を取得できませんでした。メモはそのまま入力できます。
        </p>
      ) : (
        <div className="mt-2">
          <ul className="flex flex-col gap-2">
            {selectedThemes.map(({ id, theme }) => (
              <li
                key={id}
                className="flex items-center gap-2 rounded-lg bg-sub px-3 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-white">
                  {theme ? theme.title : "課題に紐付け済み"}
                </span>
                {theme ? (
                  <span className="shrink-0 rounded bg-main px-2 py-0.5 text-[11px] text-zinc-400">
                    {themeCategoryLabel(theme.category)}
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label="課題の紐付けを外す"
                  onClick={() => handleRemove(id)}
                  className="shrink-0 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  外す
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-expanded={isPickerOpen}
            onClick={handleOpenPicker}
            className="mt-2 flex w-full items-center justify-between rounded-lg bg-sub px-3 py-3 text-sm text-white"
          >
            {selectedIds.length > 0
              ? "課題をもう1件追加"
              : "取り組む課題に紐付け"}
            <span aria-hidden className="text-zinc-400">
              {isPickerOpen ? "▲" : "▼"}
            </span>
          </button>

          {isPickerOpen ? (
            <ul className="mt-2 overflow-hidden rounded-lg bg-sub">
              {selectableThemes.length === 0 ? (
                <li className="px-3 py-3 text-xs text-zinc-400">
                  取組中の課題がありません
                </li>
              ) : (
                selectableThemes.map((theme) => (
                  <li
                    key={theme.id}
                    className="border-t border-main first:border-t-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(theme.id)}
                      className="w-full px-3 py-3 text-left text-sm text-white hover:bg-zinc-700"
                    >
                      {theme.title}
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}
