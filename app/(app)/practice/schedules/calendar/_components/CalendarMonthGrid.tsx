import type { CalendarEntry } from "@app/types/plan";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import { WEEK_DAYS, eventTypeMeta } from "@app/constants/schedule";
import { isSameMonth, monthGridWeeks } from "../_utils/calendarDate";
import { LOCKED_DAY_LABEL } from "./calendarCopy";

interface CalendarMonthGridProps {
  /** 表示する月を含む日付。 */
  cursor: string;
  selected: string;
  today: string;
  entriesByDate: Map<string, CalendarEntry[]>;
  /** 無料プランの閲覧範囲外で、back からエントリが返らない日か。 */
  isDayLocked: (iso: string) => boolean;
  onSelect: (iso: string) => void;
}

/** 1 マスに並べる予定の最大数。溢れた分は件数だけ出す。 */
const MAX_CHIPS_PER_CELL = 3;

const CELL_BASE =
  "flex min-h-[76px] flex-col gap-0.5 border-b border-r border-zinc-700 px-1 pt-1 pb-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d08000] md:min-h-[104px] lg:min-h-[124px]";

function dayNumber(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

/**
 * 月グリッド。前後の月からはみ出す日も含めて必ず週単位（7 の倍数）で並べる。
 * 日付の算出は _utils/calendarDate に閉じ込め、ここは並べるだけにしている。
 */
export default function CalendarMonthGrid({
  cursor,
  selected,
  today,
  entriesByDate,
  isDayLocked,
  onSelect,
}: CalendarMonthGridProps) {
  const weeks = monthGridWeeks(cursor);

  return (
    <div className="overflow-hidden rounded-[10px] border-l border-t border-zinc-700">
      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div
            key={day.num}
            className="border-b border-r border-zinc-700 py-1.5 text-center text-[11px] font-bold text-zinc-400"
          >
            {day.label}
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div key={week[0]} className="grid grid-cols-7">
          {week.map((iso) => {
            const entries = entriesByDate.get(iso) ?? [];
            const locked = isDayLocked(iso);
            const isSelected = iso === selected;
            const inMonth = isSameMonth(iso, cursor);
            const isToday = iso === today;

            return (
              <button
                key={iso}
                type="button"
                data-testid={`calendar-day-${iso}`}
                aria-pressed={isSelected}
                aria-current={isToday ? "date" : undefined}
                onClick={() => onSelect(iso)}
                className={`${CELL_BASE} ${isSelected ? "bg-[#d08000]/15" : "hover:bg-white/5"}`}
              >
                <span
                  className={`text-center text-[11px] ${isToday ? "font-bold text-[#d08000]" : inMonth ? "text-zinc-100" : "text-zinc-500"}`}
                >
                  {dayNumber(iso)}
                </span>

                {locked ? (
                  <span
                    data-testid={`calendar-day-locked-${iso}`}
                    className="mx-auto inline-flex items-center gap-0.5 rounded-full bg-zinc-700/80 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300"
                  >
                    <LockClosedIcon
                      className="h-2.5 w-2.5 shrink-0"
                      aria-hidden
                    />
                    {LOCKED_DAY_LABEL}
                  </span>
                ) : (
                  <>
                    {entries
                      .slice(0, MAX_CHIPS_PER_CELL)
                      .map((entry, index) => {
                        const meta = eventTypeMeta(entry.event_type);
                        return (
                          <span
                            key={`${entry.schedule_id}-${index}`}
                            data-testid="calendar-month-chip"
                            data-event-type={entry.event_type}
                            className="truncate rounded px-1 py-px text-[10px] font-bold text-white"
                            style={{ backgroundColor: meta.color }}
                          >
                            {entry.title ?? meta.label}
                          </span>
                        );
                      })}
                    {entries.length > MAX_CHIPS_PER_CELL ? (
                      <span className="px-1 text-[10px] text-zinc-400">
                        +{entries.length - MAX_CHIPS_PER_CELL}
                      </span>
                    ) : null}
                  </>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
