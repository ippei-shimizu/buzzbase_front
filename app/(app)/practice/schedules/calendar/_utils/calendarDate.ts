import { FREE_CALENDAR_WINDOW_MONTHS } from "@app/constants/schedule";

/**
 * カレンダーの日付計算。すべて `YYYY-MM-DD` 文字列を入出力する純粋関数で、
 * 表示コンポーネントから切り離してテストできるようにしている。
 */

/**
 * 「今日」の基準は back の集計（Asia/Tokyo）に合わせる。
 * 実行環境のタイムゾーンに任せると SSR と CSR で今日がずれ、
 * 無料プランの閲覧範囲（今日 ±3ヶ月）の境界も1日ずれる。
 */
const TIME_ZONE = "Asia/Tokyo";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Asia/Tokyo の今日を `YYYY-MM-DD` で返す。 */
export function todayInTokyo(now: Date = new Date()): string {
  return DATE_FORMATTER.format(now);
}

// 日付演算は UTC 固定の Date で行う。ローカルタイムゾーンで計算すると
// 夏時間や UTC+X の環境で 1 日ずれることがある。
const toDate = (iso: string): Date => new Date(`${iso}T00:00:00Z`);
const toIso = (date: Date): string => date.toISOString().slice(0, 10);

/** `YYYY-MM-DD` に日数を加算する。 */
export function addDays(iso: string, days: number): string {
  const date = toDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

/** その月の日数。うるう年の 2 月は 29 を返す。 */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * `YYYY-MM-DD` に月数を加算する。
 * 加算先に同じ日が無い場合は月末に丸める（1/31 の +1ヶ月は 2/28 または 2/29）。
 * Rails の `Date#+ n.months` と同じ丸め方にして、無料枠の境界を back と一致させる。
 */
export function addMonths(iso: string, months: number): string {
  const date = toDate(iso);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, monthIndex + months, 1));
  const lastDay = daysInMonth(target.getUTCFullYear(), target.getUTCMonth());
  return toIso(
    new Date(
      Date.UTC(
        target.getUTCFullYear(),
        target.getUTCMonth(),
        Math.min(day, lastDay),
      ),
    ),
  );
}

/** その日を含む月の 1 日。 */
export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** その日を含む月の末日。 */
export function endOfMonth(iso: string): string {
  const date = toDate(iso);
  const last = daysInMonth(date.getUTCFullYear(), date.getUTCMonth());
  return `${iso.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

/**
 * 曜日番号（月=1〜日=7）。back の Schedule#day_numbers と同じ体系。
 * JavaScript の `Date#getUTCDay()` は日=0 なので、そのまま使うと 1 日分ずれる。
 */
export function weekdayNumber(iso: string): number {
  const day = toDate(iso).getUTCDay();
  return day === 0 ? 7 : day;
}

/** その日を含む週の月曜日。front は曜日マスタ（月=1〜日=7）に合わせて週を月曜起点にする。 */
export function startOfWeek(iso: string): string {
  return addDays(iso, -(weekdayNumber(iso) - 1));
}

export interface CalendarRange {
  from: string;
  to: string;
}

/** その日を含む週（月曜〜日曜）の 7 日分。 */
export function weekDays(iso: string): string[] {
  const monday = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/**
 * 月グリッドの表示範囲。月初を含む週の月曜から、月末を含む週の日曜まで。
 * 前後の月からはみ出す日も含むため、週表示・日表示で必要な日も必ずこの中に入る
 * （その月のどの日を含む週も、この範囲に完全に収まる）。
 */
export function monthGridRange(iso: string): CalendarRange {
  return {
    from: startOfWeek(startOfMonth(iso)),
    to: addDays(startOfWeek(endOfMonth(iso)), 6),
  };
}

/** 月グリッドに並ぶ全日付（前後の月の日を含む、7 の倍数）。 */
export function monthGridDays(iso: string): string[] {
  const { from, to } = monthGridRange(iso);
  const days: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
  return days;
}

/** 月グリッドを週ごとに区切る。各行は必ず 7 日。 */
export function monthGridWeeks(iso: string): string[][] {
  const days = monthGridDays(iso);
  const weeks: string[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

/** その日が iso の月に属するか（月グリッドの前後月の日を淡く出すための判定）。 */
export function isSameMonth(iso: string, other: string): boolean {
  return iso.slice(0, 7) === other.slice(0, 7);
}

/** カレンダーの表示モード。 */
export type CalendarViewMode = "month" | "week" | "day";

/** 前後移動したときの新しい基準日。移動幅はモードごとに変える。 */
export function shiftCursor(
  mode: CalendarViewMode,
  cursor: string,
  direction: 1 | -1,
): string {
  if (mode === "month") return addMonths(startOfMonth(cursor), direction);
  return addDays(cursor, direction * (mode === "week" ? 7 : 1));
}

/** 実際に画面へ出ている日付の範囲。ペイウォールを出すかの判定に使う。 */
export function visibleRange(
  mode: CalendarViewMode,
  cursor: string,
): CalendarRange {
  if (mode === "month") return monthGridRange(cursor);
  if (mode === "week") {
    const monday = startOfWeek(cursor);
    return { from: monday, to: addDays(monday, 6) };
  }
  return { from: cursor, to: cursor };
}

/**
 * API に問い合わせる範囲。モードによらず基準日の月グリッド全体を取りに行く。
 * 月グリッドはその月のどの日を含む週も内包するため、月 → 週 → 日 の切り替えでは
 * 追加の取得が要らず、取得のやり直しは月をまたぐ移動のときだけになる。
 */
export function fetchRange(cursor: string): CalendarRange {
  return monthGridRange(cursor);
}

/**
 * 無料プランで閲覧できる期間（今日 ±FREE_CALENDAR_WINDOW_MONTHS ヶ月）。
 * back の plans#calendar が同じ幅で from / to をクランプする。
 */
export function freeCalendarWindow(today: string): CalendarRange {
  return {
    from: addMonths(today, -FREE_CALENDAR_WINDOW_MONTHS),
    to: addMonths(today, FREE_CALENDAR_WINDOW_MONTHS),
  };
}

/** その日が無料プランの閲覧範囲に入っているか。 */
export function isWithinFreeCalendarWindow(
  iso: string,
  today: string,
): boolean {
  const { from, to } = freeCalendarWindow(today);
  return iso >= from && iso <= to;
}

/**
 * 表示範囲がまるごと無料プランの閲覧範囲外か。
 * 一部でも重なっていれば back からその分のエントリは返るため、
 * 画面全体をペイウォールで置き換えず、範囲外の日だけをロック表示する。
 */
export function isRangeOutsideFreeCalendarWindow(
  range: CalendarRange,
  today: string,
): boolean {
  const window = freeCalendarWindow(today);
  return range.to < window.from || range.from > window.to;
}
