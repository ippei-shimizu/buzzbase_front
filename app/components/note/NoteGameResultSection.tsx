"use client";

import type { GameResultLinkOption } from "@app/types/gameResultLink";
import { useState } from "react";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useGameResultSearch } from "@app/hooks/note/useGameResultSearch";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { formatJaFullDate } from "@app/utils/formatDate";
import { canLinkMore } from "@app/utils/noteLinks";

interface NoteGameResultSectionProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /**
   * 更新前にノートへ紐付いていた件数（新規作成は 0）。
   * back のグランドファザリング（既存件数以下なら無料でも維持できる）に合わせるために必要。
   */
  initialCount: number;
  /** 既に紐付いている試合の表示情報。ノート詳細でサーバー取得したものを渡す。 */
  linkedOptions: GameResultLinkOption[];
}

function gameLabel(option: GameResultLinkOption): string {
  const opponent = option.opponent_team_name || "対戦相手未登録";
  return `${formatJaFullDate(option.date)} vs ${opponent}`;
}

/**
 * ノートに紐付ける試合記録のピッカー。対戦相手名でのデバウンス検索付き。
 *
 * 複数紐付けは Pro 限定だが、無料判定は「1件まで」と決め打ちしない。
 * back は既存件数を超えて増やすときだけ弾くため、既存の複数紐付けはそのまま維持できる。
 */
export default function NoteGameResultSection({
  selectedIds,
  onChange,
  initialCount,
  linkedOptions,
}: NoteGameResultSectionProps) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const { hasEntitlement, isLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();
  const { query, result, isSearching, changeQuery, loadOnce } =
    useGameResultSearch();

  const searched = result?.status === "ok" ? result.data : [];
  // 選択済みの表示名はサーバー取得分と検索結果の両方から引く（検索語を変えても名前が消えないように）。
  const knownOptions = [...linkedOptions, ...searched];
  const selectableOptions = searched.filter(
    (option) => !selectedIds.includes(option.game_result_id),
  );

  const handleOpenPicker = () => {
    if (
      !canLinkMore({
        nextCount: selectedIds.length + 1,
        initialCount,
        // Pro 判定が未確定の間は権利なしとして扱う（確定後に開き直せる）。
        hasMultiLink: !isLoading && hasEntitlement("multi_game_result_notes"),
      })
    ) {
      openProUpgradeModal({ trigger: "multi_game_result_notes" });
      return;
    }
    const next = !isPickerOpen;
    setPickerOpen(next);
    if (next) loadOnce();
  };

  const handleSelect = (id: number) => {
    onChange(selectedIds.includes(id) ? selectedIds : [...selectedIds, id]);
    setPickerOpen(false);
  };

  const handleRemove = (id: number) =>
    onChange(selectedIds.filter((selected) => selected !== id));

  return (
    <section aria-labelledby="note-game-section-heading" className="mt-8">
      <h3
        id="note-game-section-heading"
        className="text-sm font-bold text-zinc-400"
      >
        試合記録との紐付け（任意）
      </h3>

      <ul className="mt-2 flex flex-col gap-2">
        {selectedIds.map((id) => {
          const option = knownOptions.find(
            (item) => item.game_result_id === id,
          );
          return (
            <li
              key={id}
              className="flex items-center gap-2 rounded-lg bg-sub px-3 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-white">
                {option ? gameLabel(option) : "試合に紐付け済み"}
              </span>
              <button
                type="button"
                aria-label="試合の紐付けを外す"
                onClick={() => handleRemove(id)}
                className="shrink-0 text-xs font-bold text-zinc-400 hover:text-white"
              >
                外す
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        aria-expanded={isPickerOpen}
        onClick={handleOpenPicker}
        className="mt-2 flex w-full items-center justify-between rounded-lg bg-sub px-3 py-3 text-sm text-white"
      >
        {selectedIds.length > 0 ? "試合をもう1件追加" : "試合記録に紐付け"}
        <span aria-hidden className="text-zinc-400">
          {isPickerOpen ? "▲" : "▼"}
        </span>
      </button>

      {isPickerOpen ? (
        <div className="mt-2 overflow-hidden rounded-lg bg-sub">
          <input
            type="search"
            aria-label="対戦相手で検索"
            placeholder="対戦相手で検索"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            className="w-full bg-sub px-3 py-2.5 text-sm text-white placeholder:text-zinc-500"
          />
          {isSearching ? (
            <p className="border-t border-main px-3 py-3 text-xs text-zinc-400">
              検索中...
            </p>
          ) : result === null ? null : result.status !== "ok" ? (
            <p className="border-t border-main px-3 py-3 text-xs text-zinc-400">
              試合記録を取得できませんでした。
            </p>
          ) : selectableOptions.length === 0 ? (
            <p className="border-t border-main px-3 py-3 text-xs text-zinc-400">
              該当する試合記録がありません
            </p>
          ) : (
            <ul>
              {selectableOptions.map((option) => (
                <li
                  key={option.game_result_id}
                  className="border-t border-main"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option.game_result_id)}
                    className="w-full px-3 py-3 text-left text-sm text-white hover:bg-zinc-700"
                  >
                    {gameLabel(option)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
