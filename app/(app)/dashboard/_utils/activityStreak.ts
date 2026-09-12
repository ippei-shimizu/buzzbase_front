import type { ActivityLog } from "@app/types/activity";
import {
  ACTIVE_DAY_MILESTONES,
  SWING_MILESTONES,
} from "@app/constants/activity";
import { formatTotalAmount } from "@app/constants/practice";

/**
 * Streak の行動ナッジと節目（マイルストーン）の文言。
 * 判定・文言は mobile の StreakHeaderSection と一致させる。
 */

/** その日に活動があったか。段階 0 のログは「記録あり」と見なさない。 */
export function isActiveOn(logs: ActivityLog[], date: string): boolean {
  return logs.some(
    (log) => log.activity_date === date && log.intensity_level > 0,
  );
}

/**
 * 今日記録する動機になる一言を返す。
 *
 * 「自己ベスト更新」は実際に最長記録を超える場合だけ名乗る。
 * 超えない日に煽ると文言が事実と食い違い、達成の価値が薄れるため、
 * 並ぶだけの日・届かない日はそれぞれ別の文言にする。
 *
 * @param current 現在の連続日数
 * @param longest これまでの最長連続日数
 * @param todayActive 今日すでに記録があるか
 */
export function streakNudge(
  current: number,
  longest: number,
  todayActive: boolean,
): string {
  if (todayActive) {
    return current >= longest && current > 0
      ? `自己ベスト更新中！${current}日連続`
      : `${current}日連続中！今日も記録済み`;
  }
  if (current === 0) return "今日から連続記録を始めよう";

  const next = current + 1;
  if (next > longest) return `今日記録すれば自己ベスト更新の${next}日連続`;
  if (next === longest) return `今日記録すれば自己ベスト(${longest}日)に並ぶ`;
  return `今日記録すれば${next}日連続`;
}

/**
 * 次に到達する節目。すでに到達済みの値は返さない
 * （ちょうど 10 日目に立ったときの「次」は 30 になる）。
 */
export function nextMilestone(
  current: number,
  milestones: readonly number[],
): number | null {
  return milestones.find((milestone) => milestone > current) ?? null;
}

/** 通算活動日数の節目までの残り。すべて達成済みなら null。 */
export function activeDayMilestoneText(totalActiveDays: number): string | null {
  const next = nextMilestone(totalActiveDays, ACTIVE_DAY_MILESTONES);
  if (next === null) return null;
  return `通算${next}日まであと${next - totalActiveDays}日`;
}

/**
 * 素振り累計の節目までの残り。
 * 素振りの記録がまだ 1 本も無いユーザーには出さない（節目が遠すぎて動機にならない）。
 * 累計が取得できなかった場合は null を渡すこと。0 と取得失敗を同じ扱いにしない。
 */
export function swingMilestoneText(
  totalSwingCount: number | null,
): string | null {
  if (totalSwingCount === null || totalSwingCount <= 0) return null;

  const next = nextMilestone(totalSwingCount, SWING_MILESTONES);
  if (next === null) return null;
  return `素振り累計${formatTotalAmount(next, "本")}まであと${formatTotalAmount(
    next - totalSwingCount,
    "本",
  )}`;
}
