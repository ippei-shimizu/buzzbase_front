import type { Goal, GoalPeriodType } from "@app/types/goal";
import {
  GOAL_PERIOD_ORDER,
  MONTHLY_GOAL_FREE_LIMIT,
  PERSONAL_GOAL_PERIOD_TYPES,
} from "@app/constants/goal";

export type GoalTab = "in_progress" | "achieved" | "unachieved";

export const GOAL_TABS: ReadonlyArray<{ key: GoalTab; label: string }> = [
  { key: "in_progress", label: "進行中" },
  { key: "achieved", label: "達成" },
  { key: "unachieved", label: "未達" },
];

/**
 * 目標をタブへ振り分ける。
 * 達成は「期限前に手動達成した進行中の定性目標」も含み、
 * 未達は「期限到来後に未達のまま確定したもの」だけを指す。
 */
export function categorizeGoal(goal: Goal): GoalTab {
  if (goal.is_achieved) return "achieved";
  if (goal.is_finalized) return "unachieved";
  return "in_progress";
}

/**
 * 進行中（index）と確定済み（history）をまとめてタブ別に分類する。
 * back が is_finalized で排他的に返すため、2つのリストに重複は無い。
 */
export function groupGoalsByTab(
  activeGoals: Goal[],
  historyGoals: Goal[],
): Record<GoalTab, Goal[]> {
  const buckets: Record<GoalTab, Goal[]> = {
    in_progress: [],
    achieved: [],
    unachieved: [],
  };
  [...activeGoals, ...historyGoals].forEach((goal) => {
    buckets[categorizeGoal(goal)].push(goal);
  });
  return buckets;
}

/** 期間タイプ別に GOAL_PERIOD_ORDER の順で並べ、0件の期間タイプは返さない。 */
export function groupGoalsByPeriod(
  goals: Goal[],
): Array<{ periodType: GoalPeriodType; goals: Goal[] }> {
  return GOAL_PERIOD_ORDER.map((periodType) => ({
    periodType,
    goals: goals.filter((goal) => goal.period_type === periodType),
  })).filter((group) => group.goals.length > 0);
}

/**
 * 進捗バーの塗り幅（%）。
 * back の progress_percent をそのまま使い、不正値・範囲外だけを丸める
 * （0〜100 の外に出ると帯が枠から溢れる）。
 */
export function progressBarWidth(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

/**
 * 達成トグルを出してよい目標か。
 * 定性目標だけが achievement API の対象で、数値目標・自由指標は back が 422 を返す。
 * 確定済みの目標は結果が固定されるため操作させない。
 */
export function canToggleAchievement(goal: Goal): boolean {
  return goal.kind === "qualitative" && !goal.is_finalized;
}

/** 確定済みの目標は編集できない（期間も結果も固定されるため）。 */
export function isGoalEditable(goal: Goal): boolean {
  return !goal.is_finalized;
}

/**
 * 無料枠を消費している目標の件数。
 * back の PlanLimits#active_monthly_goals_count と同じく、進行中かつ個人の期間目標だけを数える
 * （シーズン・大会は件数ではなく Pro 限定機能として別に判定される）。
 */
export function countPersonalPeriodGoals(activeGoals: Goal[]): number {
  return activeGoals.filter((goal) =>
    PERSONAL_GOAL_PERIOD_TYPES.includes(goal.period_type),
  ).length;
}

interface FreeLimitParams {
  activeGoals: Goal[];
  hasUnlimited: boolean;
  isEntitlementLoading: boolean;
}

/**
 * 個人の期間目標を新規作成できないか（無料枠が埋まっているか）。
 *
 * back は「上限以上でも既存分は維持できる」グランドファザリング実装（新規作成だけを弾く）なので、
 * ここでも判定するのは新規作成の可否だけ。既存目標の編集・削除は件数に関係なく許可する。
 * Pro 判定が未確定の間は上限扱いにしない（Pro 加入者へ誤って上限を告知しないため）。
 */
export function isAtGoalFreeLimit({
  activeGoals,
  hasUnlimited,
  isEntitlementLoading,
}: FreeLimitParams): boolean {
  if (isEntitlementLoading || hasUnlimited) return false;
  return countPersonalPeriodGoals(activeGoals) >= MONTHLY_GOAL_FREE_LIMIT;
}
