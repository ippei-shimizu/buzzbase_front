import type { ActivityLog } from "@app/types/activity";
import {
  addDays,
  startOfWeek,
  weekdayNumber,
} from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import { ACTIVITY_LEVEL_LABELS } from "@app/constants/activity";
import { parseDecimal } from "@app/constants/practice";

/**
 * 草グラフ（週=列 / 曜日=行）の日付計算。
 * 日付演算そのものは予定カレンダーと同じ純粋関数（calendarDate）に委ね、
 * ここでは「週へ切り分ける」「月ラベルを置く」といった並べ方だけを担当する。
 */

/** 1マス。範囲外を埋めるパディングは date が null になる。 */
export interface HeatmapCell {
  date: string | null;
}

/** 1列（1週間ぶん）。cells は必ず 7 個で、先頭が月曜。 */
export interface HeatmapColumn {
  cells: HeatmapCell[];
  /** その列の上に出す月ラベル。前の列と同じ月なら空文字。 */
  monthLabel: string;
}

/**
 * 行ラベル（曜日）。列が月曜始まりなので index 0 が月曜になる。
 * GitHub 同様、詰まって読めなくなるのを避けて 1 つ飛ばしで出す。
 */
export const WEEKDAY_ROW_LABELS = ["月", "", "水", "", "金", "", ""] as const;

const WEEKDAY_NAMES = ["月", "火", "水", "木", "金", "土", "日"] as const;

/**
 * from〜to を週（列）× 曜日（行）に並べ替える。
 *
 * 週は予定カレンダーと同じ月曜起点にする（back の曜日体系が 月=1〜日=7 のため、
 * front 全体でその区切りに揃える）。列の先頭・末尾で範囲からはみ出すマスは
 * date: null のパディングになり、「記録が無い日」とは区別される。
 *
 * @param from 期間開始日（YYYY-MM-DD）
 * @param to 期間終了日（YYYY-MM-DD）。from より前なら空配列を返す。
 */
export function buildHeatmapColumns(from: string, to: string): HeatmapColumn[] {
  if (to < from) return [];

  const columns: HeatmapColumn[] = [];
  let previousMonth = "";

  for (
    let monday = startOfWeek(from);
    monday <= to;
    monday = addDays(monday, 7)
  ) {
    const cells: HeatmapCell[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(monday, offset);
      cells.push({ date: date >= from && date <= to ? date : null });
    }

    // 月ラベルはその列で最初に範囲内へ入る日の月に付ける。
    // 列の途中で月が変わる場合、ラベルは次の列（=その月の日が先頭に来る列）へ回る。
    const firstDate = cells.find((cell) => cell.date !== null)?.date ?? null;
    const month = firstDate === null ? "" : firstDate.slice(0, 7);
    const isNewMonth = month !== "" && month !== previousMonth;
    if (isNewMonth) previousMonth = month;

    columns.push({
      cells,
      monthLabel: isNewMonth ? `${Number(month.slice(5, 7))}月` : "",
    });
  }

  return columns;
}

/**
 * 指定日を含む列の index。含まれていなければ最後の列を返す。
 * 今日の列へ自動スクロールする位置決めに使う。
 */
export function columnIndexOf(columns: HeatmapColumn[], date: string): number {
  const index = columns.findIndex((column) =>
    column.cells.some((cell) => cell.date === date),
  );
  return index === -1 ? columns.length - 1 : index;
}

/** 日付を「2026年7月4日(火)」表記にする。 */
export function formatJaDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const weekday = WEEKDAY_NAMES[weekdayNumber(iso) - 1];
  return `${Number(year)}年${Number(month)}月${Number(day)}日(${weekday})`;
}

/** その日の内容を「メニュー3種 / 素振り120本 / 試合」のように並べる。 */
export function describeActivity(log: ActivityLog | null): string {
  if (log === null) return "未記録";

  const menuCount = parseDecimal(log.practice_menu_count) ?? 0;
  const swingCount = parseDecimal(log.total_swing_count) ?? 0;

  const parts: string[] = [];
  if (menuCount > 0) parts.push(`メニュー${menuCount}種`);
  if (swingCount > 0) parts.push(`素振り${swingCount}本`);
  if (log.has_game) parts.push("試合");

  return parts.length > 0 ? parts.join(" / ") : "記録あり";
}

/**
 * 1マスの説明文。キャプションと aria-label の両方に同じ文字列を使い、
 * 目で見える情報と読み上げられる情報がずれないようにする。
 * 色の濃淡でしか分からない段階を言葉でも伝えるため、活動量ラベルを添える。
 */
export function describeActivityCell(
  date: string,
  log: ActivityLog | null,
): string {
  const level = log?.intensity_level ?? 0;
  const base = `${formatJaDate(date)} ・ ${describeActivity(log)}`;
  if (level <= 0) return base;
  return `${base} ・ 活動量${ACTIVITY_LEVEL_LABELS[level] ?? ""}`;
}

/** 日付をキーにしたログの索引。マス描画時の線形探索を避ける。 */
export function indexLogsByDate(logs: ActivityLog[]): Map<string, ActivityLog> {
  return new Map(logs.map((log) => [log.activity_date, log]));
}
