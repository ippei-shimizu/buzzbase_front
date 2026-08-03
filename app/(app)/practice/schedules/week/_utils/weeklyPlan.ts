import type { Schedule } from "@app/types/schedule";
import {
  addDays,
  weekDays,
} from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";

/**
 * 週プランの日付・並び替えロジック。
 *
 * 週の起点（月曜）や日付の加算は #483 の calendarDate.ts に実装済みのものを使う。
 * ここで独自に曜日計算を持つと、カレンダーと週プランで週の切れ目がずれる。
 */

/** その週の月曜〜日曜（7日分）。週始まりは月曜（曜日マスタの月=1〜日=7 に合わせる）。 */
export function weekDates(weekStart: string): string[] {
  return weekDays(weekStart);
}

/** その週の最終日（日曜）。 */
export function weekEnd(weekStart: string): string {
  return addDays(weekStart, 6);
}

/** 翌週の同じ曜日。「来週にコピー」後の表示週の移動に使う。 */
export function nextWeekStart(weekStart: string): string {
  return addDays(weekStart, 7);
}

/** "2026-08-03" と "2026-08-09" → "8/3〜8/9"。 */
export function weekRangeLabel(weekStart: string): string {
  const end = weekEnd(weekStart);
  const short = (iso: string) =>
    `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
  return `${short(weekStart)}〜${short(end)}`;
}

/** 時刻順（未設定は末尾）。back の plans#by_date と同じ並びにする。 */
function byScheduledTime(a: Schedule, b: Schedule): number {
  return (a.scheduled_time ?? "99:99").localeCompare(
    b.scheduled_time ?? "99:99",
  );
}

/**
 * その週に入る単発予定（planned_on 持ち）を日付ごとにまとめる。
 *
 * 毎週の繰り返し予定は含めない。週プランで扱うのは「その日だけの予定」で、
 * 「来週にコピー」の対象（back の schedules.single）と一致させるため。
 * 繰り返し予定まで並べると、コピーされないものがコピー対象に見えてしまう。
 */
export function singleSchedulesByDate(
  schedules: Schedule[],
  weekStart: string,
): Map<string, Schedule[]> {
  const end = weekEnd(weekStart);
  const grouped = new Map<string, Schedule[]>();

  schedules.forEach((schedule) => {
    const date = schedule.planned_on;
    if (date === null || date < weekStart || date > end) return;
    const list = grouped.get(date);
    if (list) list.push(schedule);
    else grouped.set(date, [schedule]);
  });

  grouped.forEach((list) => list.sort(byScheduledTime));
  return grouped;
}

/**
 * コピーで作成された予定を手元の一覧へ取り込む。
 *
 * back は同一内容の予定を作り直さない（冪等）ため、連続実行でも重複は増えない想定だが、
 * 取り込み側でも id で重ねて防ぐ。サーバー再取得を待たずに移動先の週へ反映するために使う。
 */
export function mergeSchedules(
  current: Schedule[],
  added: Schedule[],
): Schedule[] {
  const existingIds = new Set(current.map((schedule) => schedule.id));
  return [
    ...current,
    ...added.filter((schedule) => !existingIds.has(schedule.id)),
  ];
}
