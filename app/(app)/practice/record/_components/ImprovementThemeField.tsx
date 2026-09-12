"use client";

import type { ImprovementTheme } from "@app/types/improvementTheme";
import FlagIcon from "@heroicons/react/24/outline/FlagIcon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  MULTI_THEME_LIMIT_MESSAGE,
  THEME_EMPTY_MESSAGE,
} from "./practiceRecordCopy";

interface ImprovementThemeFieldProps {
  /** 紐付け候補（取組中の課題）。 */
  themes: ImprovementTheme[];
  selectedThemeIds: number[];
  /**
   * 読み込み時点で紐付いていた件数。
   * back は既存件数を超えて増やすときだけ Pro 判定するため（グランドファザリング）、
   * 無料プランでも既存の複数紐付けは維持できるようにこの件数を上限に使う。
   */
  linkedThemeCountAtLoad: number;
  onChange: (themeIds: number[]) => void;
}

/** 一覧に出ない課題（達成済みなど）に紐付いている場合の表示名。紐付けを黙って外さないために出す。 */
const UNKNOWN_THEME_LABEL = "課題に紐付け済み";

/**
 * 練習記録に紐付ける課題を選ぶフィールド。
 * 無料プランは1件まで（読み込み時点で複数紐付いていればその件数まで）で、
 * 超えて追加しようとしたときは保存前に Pro 訴求へ倒す。
 */
export default function ImprovementThemeField({
  themes,
  selectedThemeIds,
  linkedThemeCountAtLoad,
  onChange,
}: ImprovementThemeFieldProps) {
  const { hasEntitlement, isLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const maxWithoutPro = Math.max(1, linkedThemeCountAtLoad);
  // 判定が確定するまでは上限扱いにしない。未確定のまま塞ぐと Pro 加入者に上限を誤って告知してしまう。
  const isAtLimit =
    !isLoading &&
    !hasEntitlement("multi_improvement_theme_links") &&
    selectedThemeIds.length >= maxWithoutPro;

  const handleToggle = (themeId: number) => {
    if (selectedThemeIds.includes(themeId)) {
      onChange(selectedThemeIds.filter((id) => id !== themeId));
      return;
    }
    if (isAtLimit) {
      openProUpgradeModal({ trigger: "multi_improvement_theme_links" });
      return;
    }
    onChange([...selectedThemeIds, themeId]);
  };

  const unlistedThemeIds = selectedThemeIds.filter(
    (id) => !themes.some((theme) => theme.id === id),
  );

  return (
    <div>
      {themes.length === 0 && unlistedThemeIds.length === 0 ? (
        <p className="text-sm text-zinc-400">{THEME_EMPTY_MESSAGE}</p>
      ) : (
        <ul className="space-y-2">
          {themes.map((theme) => {
            const isSelected = selectedThemeIds.includes(theme.id);
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggle(theme.id)}
                  className={`flex w-full items-center gap-2 rounded-[10px] px-3.5 py-3 text-left text-sm ${
                    isSelected
                      ? "bg-sub text-white ring-1 ring-[#d08000]"
                      : "bg-sub text-zinc-300"
                  }`}
                >
                  <FlagIcon
                    className="h-4 w-4 shrink-0 text-[#d08000]"
                    aria-hidden
                  />
                  {theme.title}
                </button>
              </li>
            );
          })}
          {unlistedThemeIds.map((themeId) => (
            <li
              key={themeId}
              className="flex items-center gap-2 rounded-[10px] bg-sub px-3.5 py-3 text-sm text-zinc-300"
            >
              <FlagIcon
                className="h-4 w-4 shrink-0 text-[#d08000]"
                aria-hidden
              />
              <span className="flex-1">{UNKNOWN_THEME_LABEL}</span>
              <button
                type="button"
                aria-label={`${UNKNOWN_THEME_LABEL}を外す`}
                onClick={() => handleToggle(themeId)}
                className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:text-white"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {isAtLimit ? (
        <p className="mt-2 text-xs text-zinc-400">
          {MULTI_THEME_LIMIT_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}
