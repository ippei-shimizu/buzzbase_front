import {
  addDays,
  todayInTokyo,
  weekdayNumber,
} from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";

/** `weekdayNumber`（月=1〜日=7）の順に並べた曜日ラベル。 */
const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

export interface RecentPracticeDateLabel {
  /** 「今日」「昨日」「一昨日」または「5/12」。 */
  main: string;
  /** 「火」など曜日1文字。 */
  weekday: string;
}

/**
 * 相対表記の本体。3日前より古い日は月日で出す。
 * 未来の日付（端末の時計ずれ等）も月日側へ倒し、「今日」を名乗らせない。
 */
function relativeLabel(iso: string, today: string): string {
  if (iso === today) return "今日";
  if (iso === addDays(today, -1)) return "昨日";
  if (iso === addDays(today, -2)) return "一昨日";
  const [, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}`;
}

/**
 * 練習日を「今日 (火)」「昨日 (月)」「5/12 (水)」の相対表記にする（mobile の最近の練習と同じ表記）。
 *
 * 基準日は Asia/Tokyo の今日。実行環境（Vercel は UTC）の日付で判定すると
 * 日本時間の朝までに記録した練習が「昨日」に見えるなど、境界が丸ごと1日ずれる。
 *
 * @param loggedOn 練習日（`YYYY-MM-DD`）
 * @param today 基準日（`YYYY-MM-DD`）。省略時は Asia/Tokyo の今日
 */
export function recentPracticeDateLabel(
  loggedOn: string,
  today: string = todayInTokyo(),
): RecentPracticeDateLabel {
  const iso = loggedOn.slice(0, 10);
  return {
    main: relativeLabel(iso, today),
    weekday: WEEKDAY_LABELS[weekdayNumber(iso) - 1],
  };
}
