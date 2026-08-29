const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/**
 * `YYYY-MM-DD` をローカル日付として解釈する。
 * `new Date("2026-07-14")` は UTC 深夜として解釈され、日本時間では前日にずれるため使わない。
 */
function parseLocalDate(logged_on: string): Date {
  const [year, month, day] = logged_on.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** 練習日を「7月14日(火)」形式にする。 */
export function formatPracticeDate(logged_on: string): string {
  const date = parseLocalDate(logged_on);
  return `${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAYS[date.getDay()]})`;
}

/** 一覧のタイムライン左端に出す日（`14`）。 */
export function practiceDayOfMonth(logged_on: string): number {
  return parseLocalDate(logged_on).getDate();
}

/** 一覧のタイムライン左端に出す曜日（`火`）。 */
export function practiceWeekday(logged_on: string): string {
  return WEEKDAYS[parseLocalDate(logged_on).getDay()];
}
