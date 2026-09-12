import type { CalendarEntry } from "@app/types/plan";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import Link from "next/link";
import { WEEK_DAYS } from "@app/constants/schedule";
import { weekdayNumber } from "../_utils/calendarDate";
import {
  ADD_PLAN_LABEL,
  EMPTY_MESSAGE,
  PAYWALL_RANGE_NOTICE,
} from "./calendarCopy";
import CalendarEntryRow, { addPlanHref } from "./CalendarEntryRow";

interface CalendarDaySectionProps {
  date: string;
  entries: CalendarEntry[];
  today: string;
  /** 無料プランの閲覧範囲外で、そもそも back からエントリが返らない日か。 */
  locked: boolean;
}

/** "2026-07-06" → "7月6日(月)"。曜日ラベルは月=1〜日=7 のマスタから引く。 */
export function formatDayLabel(iso: string): string {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  const weekday = WEEK_DAYS.find((item) => item.num === weekdayNumber(iso));
  return `${month}月${day}日(${weekday?.label ?? ""})`;
}

/**
 * 1 日分の予定リスト。週表示・日表示・月表示の選択日の詳細で共用する。
 *
 * 予定の作成自体は無料プランでも無制限なので、閲覧範囲外の日でも追加ボタンは残す。
 * 一方で「予定が 0 件」と「Pro でないため取得できていない」は意味が違うため、
 * 空表示と閲覧範囲外の案内は文言を分ける。
 */
export default function CalendarDaySection({
  date,
  entries,
  today,
  locked,
}: CalendarDaySectionProps) {
  return (
    <section
      data-testid={`calendar-day-section-${date}`}
      className="border-b border-zinc-700 py-3 last:border-b-0"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3
          className={`text-sm font-bold ${date === today ? "text-[#d08000]" : "text-zinc-200"}`}
        >
          {formatDayLabel(date)}
        </h3>
        <Link
          href={addPlanHref(date)}
          aria-label={`${formatDayLabel(date)} ${ADD_PLAN_LABEL}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#d08000] px-2.5 py-1 text-xs font-bold text-[#d08000] transition-colors"
        >
          <PlusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {ADD_PLAN_LABEL}
        </Link>
      </div>

      {locked ? (
        <p className="flex items-center gap-1.5 py-1 text-xs text-zinc-400">
          <LockClosedIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {PAYWALL_RANGE_NOTICE}
        </p>
      ) : entries.length === 0 ? (
        <p className="py-1 text-xs text-zinc-500">{EMPTY_MESSAGE}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((entry, index) => (
            <CalendarEntryRow
              key={`${entry.schedule_id}-${index}`}
              entry={entry}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
