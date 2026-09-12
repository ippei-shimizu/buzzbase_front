import type { ImprovementThemeStatus } from "@app/types/improvementTheme";

/**
 * 無料プランで同時に取り組める課題の上限。
 * back/app/models/concerns/plan_limits.rb の IMPROVEMENT_THEME_FREE_LIMIT と一致させる。
 * back は `status: "open"` の課題だけを数えるため、克服・アーカイブ済みは枠を消費しない。
 */
export const IMPROVEMENT_THEME_FREE_LIMIT = 2;

/** 課題のカテゴリ選択肢。back の ImprovementTheme::CATEGORIES と順序まで揃える。 */
export const THEME_CATEGORIES: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "batting", label: "打撃" },
  { value: "pitching", label: "投球" },
  { value: "defense", label: "守備" },
  { value: "baserunning", label: "走塁" },
  { value: "training", label: "トレーニング" },
  { value: "strength", label: "筋トレ" },
  { value: "care", label: "ケア" },
  { value: "other", label: "その他" },
];

/** カテゴリ値の表示ラベル。未設定・未知の値は mobile と同じく「その他」に寄せる。 */
export function themeCategoryLabel(value: string | null): string {
  return (
    THEME_CATEGORIES.find((category) => category.value === value)?.label ??
    "その他"
  );
}

/** 課題の取組状況の表示ラベル。 */
export const THEME_STATUS_LABELS: Record<ImprovementThemeStatus, string> = {
  open: "取組中",
  achieved: "克服",
  archived: "アーカイブ",
};
