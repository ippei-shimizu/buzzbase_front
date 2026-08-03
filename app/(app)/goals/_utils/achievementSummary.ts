import type { Goal, GoalBadge } from "@app/types/goal";
import { todayString } from "./goalForm";

/**
 * 月の境界は back の FinalizeGoalsJob（Asia/Tokyo で期限到来を判定）と揃える。
 * 実行環境のタイムゾーンに任せると、月初・月末に前月がひと月ずれる。
 */
const TIME_ZONE = "Asia/Tokyo";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
});

// back が Date 型カラム（deadline）を返す形式。日時と違いタイムゾーンを持たない。
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number): string => String(value).padStart(2, "0");

function tokyoMonthKey(date: Date): string {
  const parts = MONTH_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

/**
 * ISO の日付・日時を月キー（YYYY-MM）へ変換する。
 *
 * 日付のみ（YYYY-MM-DD）はタイムゾーンを持たないため文字列のまま切り出す。
 * Date へ通すと UTC 深夜として解釈され、月初・月末の deadline が隣の月へ移ってしまう。
 *
 * @param iso `YYYY-MM-DD` またはオフセット付きの ISO8601 日時
 * @returns 月キー。解釈できない値なら空文字（どの月にも一致しない）。
 */
export function monthKeyOf(iso: string): string {
  if (DATE_ONLY_PATTERN.test(iso)) return iso.slice(0, 7);

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return tokyoMonthKey(date);
}

/**
 * 直近の「終わった月」のキー（YYYY-MM）。
 * 今月はまだ期限未到来の目標が残るため振り返りの対象にしない。
 *
 * @param now 判定の基準時刻（既定は現在時刻）
 */
export function previousMonthKey(now: Date = new Date()): string {
  const [year, month] = todayString(now).split("-").map(Number);
  return month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`;
}

/** ISO の日付・日時が指定した月キーに属するか。 */
export function isDateInMonth(iso: string, monthKey: string): boolean {
  return monthKeyOf(iso) === monthKey;
}

/** 月キー（YYYY-MM）を日本語表示（YYYY年M月）へ変換する。 */
export function formatMonthKeyJa(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}年${month}月`;
}

export interface AchievementSummary {
  /** 対象月にその月の期限を迎え、確定した目標の件数（「N件中」の N）。 */
  finalizedCount: number;
  /** そのうち達成で確定した件数（「M件達成」の M）。 */
  achievedCount: number;
  /** 対象月に付与されたバッジの個数。 */
  badgeCount: number;
}

/**
 * 対象月の達成サマリーを集計する。
 *
 * 「期限を迎えた目標」は back の FinalizeGoalsJob に合わせて
 * 「deadline が対象月にあり、かつ確定済み（is_finalized）の目標」と定義する。
 * 期限前に手動達成しただけの未確定目標は、まだ期限を迎えていないので数えない。
 *
 * @param history 確定済み目標の履歴（GET /api/v2/goals/history）
 * @param badges 付与済みバッジ（GET /api/v2/goal_badges）
 * @param monthKey 対象月（YYYY-MM）
 */
export function summarizeAchievements(
  history: Goal[],
  badges: GoalBadge[],
  monthKey: string,
): AchievementSummary {
  const finalized = history.filter(
    (goal) => goal.is_finalized && isDateInMonth(goal.deadline, monthKey),
  );

  return {
    finalizedCount: finalized.length,
    achievedCount: finalized.filter((goal) => goal.is_achieved).length,
    badgeCount: badges.filter((badge) =>
      isDateInMonth(badge.awarded_at, monthKey),
    ).length,
  };
}

/**
 * 振り返るものがある月か。
 *
 * 達成 0 件でもモーダルは出す（未達で終わったことに気づける方が価値があり、
 * 達成 0 件のときは祝う文言を出さない作りにしてある）。
 * 期限を迎えた目標が 1 件も無い月だけ、振り返る対象が無いので出さない。
 */
export function hasAchievementSummary(summary: AchievementSummary): boolean {
  return summary.finalizedCount > 0;
}
