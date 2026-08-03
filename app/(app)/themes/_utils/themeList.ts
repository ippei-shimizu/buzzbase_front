import type {
  ImprovementTheme,
  ImprovementThemeInput,
  ImprovementThemeStatus,
} from "@app/types/improvementTheme";
import { IMPROVEMENT_THEME_FREE_LIMIT } from "@app/constants/improvementTheme";

/** タブは back の status enum（open / achieved / archived）と1対1で対応する。 */
export const THEME_TABS: ReadonlyArray<{
  key: ImprovementThemeStatus;
  label: string;
}> = [
  { key: "open", label: "取組中" },
  { key: "achieved", label: "克服" },
  { key: "archived", label: "アーカイブ" },
];

/** 課題を status ごとに振り分ける。件数バッジと一覧表示の両方がこの結果を使う。 */
export function groupThemesByStatus(
  themes: ImprovementTheme[],
): Record<ImprovementThemeStatus, ImprovementTheme[]> {
  const buckets: Record<ImprovementThemeStatus, ImprovementTheme[]> = {
    open: [],
    achieved: [],
    archived: [],
  };
  themes.forEach((theme) => buckets[theme.status].push(theme));
  return buckets;
}

/**
 * 無料枠を消費している課題の件数。
 * back の PlanLimits#open_improvement_themes_count と同じく **取組中（open）だけ** を数える
 * （克服・アーカイブ済みは何件あっても枠を消費しない）。
 */
export function countOpenThemes(themes: ImprovementTheme[]): number {
  return themes.filter((theme) => theme.status === "open").length;
}

interface FreeLimitParams {
  themes: ImprovementTheme[];
  hasUnlimited: boolean;
  isEntitlementLoading: boolean;
}

/**
 * 課題を新規作成できないか（無料枠が埋まっているか）。
 *
 * back は新規作成だけを弾き、既に上限を超えている課題の編集・状態変更は許す。
 * Pro 判定が未確定の間は上限扱いにしない（Pro 加入者へ誤って上限を告知しないため）。
 */
export function isAtThemeFreeLimit({
  themes,
  hasUnlimited,
  isEntitlementLoading,
}: FreeLimitParams): boolean {
  if (isEntitlementLoading || hasUnlimited) return false;
  return countOpenThemes(themes) >= IMPROVEMENT_THEME_FREE_LIMIT;
}

/** 詳細画面に出す状態遷移の操作。mobile の課題詳細と同じ組み合わせにする。 */
export interface ThemeTransitions {
  /** 「克服した」を出すか。取組中の課題にだけ出す。 */
  canAchieve: boolean;
  /** 「取組中に戻す」を出すか。克服・アーカイブ済みの課題に出す。 */
  canReopen: boolean;
  /** 「アーカイブ」を出すか。既にアーカイブ済みなら出さない。 */
  canArchive: boolean;
}

export function themeTransitions(
  status: ImprovementThemeStatus,
): ThemeTransitions {
  return {
    canAchieve: status === "open",
    canReopen: status !== "open",
    canArchive: status !== "archived",
  };
}

/**
 * 状態遷移で送る更新パラメータ。
 *
 * 克服時は達成日を記録し、取組中へ戻すときは達成日を消す（克服していないのに
 * 克服日が残ると詳細の表示が実態とずれる）。back は status の遷移に制約を持たず、
 * 送った値をそのまま保存する。
 */
export function buildThemeStatusInput(
  status: ImprovementThemeStatus,
  today: string,
): ImprovementThemeInput {
  if (status === "achieved") return { status, achieved_on: today };
  if (status === "open") return { status, achieved_on: null };
  return { status };
}
