"use client";

import type { CalendarRange, CalendarViewMode } from "../_utils/calendarDate";
import type { FetchResult } from "@app/services/v2/requests";
import type { CalendarEntry, CalendarResponse } from "@app/types/plan";
import ChevronLeftIcon from "@heroicons/react/24/outline/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import { useRef, useState } from "react";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { useHorizontalSwipe } from "@app/hooks/useHorizontalSwipe";
import { getPlanCalendar } from "@app/services/v2/planService";
import {
  fetchRange,
  isRangeOutsideFreeCalendarWindow,
  isWithinFreeCalendarWindow,
  shiftCursor,
  visibleRange,
  weekDays,
} from "../_utils/calendarDate";
import {
  LOADING_MESSAGE,
  LOAD_ERROR,
  MODE_DAY_LABEL,
  MODE_GROUP_LABEL,
  MODE_MONTH_LABEL,
  MODE_WEEK_LABEL,
  NEXT_LABEL,
  PAYWALL_DESCRIPTION,
  PAYWALL_TITLE,
  PREV_LABEL,
  TODAY_LABEL,
} from "./calendarCopy";
import CalendarDaySection, { formatDayLabel } from "./CalendarDaySection";
import CalendarMonthGrid from "./CalendarMonthGrid";

const FEATURE = "schedule_calendar_full_history" as const;

const VIEW_MODES: ReadonlyArray<{ value: CalendarViewMode; label: string }> = [
  { value: "month", label: MODE_MONTH_LABEL },
  { value: "week", label: MODE_WEEK_LABEL },
  { value: "day", label: MODE_DAY_LABEL },
];

const rangeKey = (range: CalendarRange): string => `${range.from}_${range.to}`;

/** 前後移動のヘッダーに出す表示中の期間。 */
function rangeLabel(mode: CalendarViewMode, cursor: string): string {
  const year = cursor.slice(0, 4);
  if (mode === "month") return `${year}年${Number(cursor.slice(5, 7))}月`;
  if (mode === "week") {
    const days = weekDays(cursor);
    return `${formatDayLabel(days[0])} - ${formatDayLabel(days[6])}`;
  }
  return `${year}年${formatDayLabel(cursor)}`;
}

function groupByDate(entries: CalendarEntry[]): Map<string, CalendarEntry[]> {
  const grouped = new Map<string, CalendarEntry[]>();
  entries.forEach((entry) => {
    const list = grouped.get(entry.date);
    if (list) list.push(entry);
    else grouped.set(entry.date, [entry]);
  });
  return grouped;
}

interface PlanCalendarContentProps {
  /** Asia/Tokyo の今日。無料プランの閲覧範囲の基準になる。 */
  today: string;
  /** Server Component が先に取得した初期表示範囲。 */
  initialRange: CalendarRange;
  initialResult: FetchResult<CalendarResponse>;
  /**
   * 横スワイプで月/週/日を切り替えるか。
   * 練習プランのタブに埋め込むときは外側のタブ送りと競合するため false にする。
   */
  swipeEnabled?: boolean;
}

/**
 * 予定カレンダーの Container。
 *
 * - 表示モード（月/週/日）と基準日を持ち、前後移動のたびに Server Action で取得する。
 * - 取得範囲はモードに依らず基準日の月グリッド全体にしているため、モード切り替えでは
 *   再取得が起きない（週・日は必ず月グリッドの内側に入る）。
 * - 無料プランの閲覧範囲は back がクランプする。front は同じ幅で「その日は取得できていない」
 *   ことを明示するだけで、範囲判定の正はあくまで back に置く。
 */
export default function PlanCalendarContent({
  today,
  initialRange,
  initialResult,
  swipeEnabled = true,
}: PlanCalendarContentProps) {
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();

  const [mode, setMode] = useState<CalendarViewMode>("month");

  const [cursor, setCursor] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [resultsByRange, setResultsByRange] = useState<
    Record<string, FetchResult<CalendarResponse>>
  >({ [rangeKey(initialRange)]: initialResult });

  const currentKey = rangeKey(fetchRange(cursor));
  const result = resultsByRange[currentKey];

  // 取得中のレンジ。解決前に予約しておかないと、前後を連打したときに
  // 同じレンジへ何度もリクエストが飛ぶ。
  const inFlightRangesRef = useRef<Set<string>>(new Set());

  const loadRange = (nextCursor: string) => {
    const range = fetchRange(nextCursor);
    const key = rangeKey(range);
    if (resultsByRange[key] || inFlightRangesRef.current.has(key)) return;
    inFlightRangesRef.current.add(key);
    // 範囲外でも取得はする。back がクランプした実データを持っておくことで、
    // Pro 判定が後から確定しても取得済みの内容をそのまま出せる。
    void getPlanCalendar(range.from, range.to)
      .then((fetched) => {
        setResultsByRange((previous) => ({ ...previous, [key]: fetched }));
      })
      .finally(() => {
        inFlightRangesRef.current.delete(key);
      });
  };

  const moveTo = (nextCursor: string) => {
    setCursor(nextCursor);
    // 月をまたぐ移動では選択日が画面外になるため、移動先の先頭日へ寄せる。
    setSelectedDate(nextCursor);
    loadRange(nextCursor);
    // 前後の月を先読みしておき、連続して送るときに待たせない。
    loadRange(shiftCursor("month", nextCursor, 1));
    loadRange(shiftCursor("month", nextCursor, -1));
  };

  const shift = (direction: 1 | -1) =>
    moveTo(shiftCursor(mode, cursor, direction));

  // 横スワイプは月/週/日の切り替えに割り当てる（日付送りは前後ボタンが担う）。
  const swipeHandlers = useHorizontalSwipe((direction) => {
    const currentIndex = VIEW_MODES.findIndex((item) => item.value === mode);
    const nextIndex =
      direction === "left"
        ? Math.min(currentIndex + 1, VIEW_MODES.length - 1)
        : Math.max(currentIndex - 1, 0);
    setMode(VIEW_MODES[nextIndex].value);
  });

  // Pro 判定が未確定の間は範囲外扱いにしない。先に無料前提でロックすると、
  // 加入済みユーザーに一瞬ペイウォールが見えてしまう。
  const isRangeLimited = !isEntitlementLoading && !hasEntitlement(FEATURE);
  const isDayLocked = (iso: string): boolean =>
    isRangeLimited && !isWithinFreeCalendarWindow(iso, today);
  const isWholeViewLocked =
    isRangeLimited &&
    isRangeOutsideFreeCalendarWindow(visibleRange(mode, cursor), today);

  const entriesByDate = groupByDate(
    result?.status === "ok" ? result.data.entries : [],
  );
  const entriesOf = (iso: string): CalendarEntry[] =>
    entriesByDate.get(iso) ?? [];

  const agendaDates = mode === "week" ? weekDays(cursor) : [cursor];

  return (
    <div
      className="flex flex-col gap-4"
      {...(swipeEnabled ? swipeHandlers : {})}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label={MODE_GROUP_LABEL}
          className="flex rounded-lg bg-sub p-0.5"
        >
          {VIEW_MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={mode === item.value}
              onClick={() => setMode(item.value)}
              className={`w-12 rounded-md py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] ${
                mode === item.value
                  ? "bg-[#d08000] text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => moveTo(today)}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:border-[#d08000] hover:text-[#d08000]"
        >
          {TODAY_LABEL}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={PREV_LABEL}
          onClick={() => shift(-1)}
          className="rounded-full p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden />
        </button>
        <p
          data-testid="calendar-range-label"
          aria-live="polite"
          className="text-base font-bold text-white"
        >
          {rangeLabel(mode, cursor)}
        </p>
        <button
          type="button"
          aria-label={NEXT_LABEL}
          onClick={() => shift(1)}
          className="rounded-full p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
        >
          <ChevronRightIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {isWholeViewLocked ? (
        <ProUpsellCard
          feature={FEATURE}
          title={PAYWALL_TITLE}
          description={PAYWALL_DESCRIPTION}
        />
      ) : result === undefined ? (
        <div
          aria-busy="true"
          className="h-64 animate-pulse rounded-[10px] bg-sub"
        >
          <p className="sr-only">{LOADING_MESSAGE}</p>
        </div>
      ) : result.status !== "ok" ? (
        // 取得失敗を空表示に丸めると「予定なし」と誤読され、重複登録を招く。
        <p className="py-8 text-center text-sm text-zinc-400">{LOAD_ERROR}</p>
      ) : mode === "month" ? (
        <>
          <CalendarMonthGrid
            cursor={cursor}
            selected={selectedDate}
            today={today}
            entriesByDate={entriesByDate}
            isDayLocked={isDayLocked}
            onSelect={setSelectedDate}
          />
          <CalendarDaySection
            date={selectedDate}
            entries={entriesOf(selectedDate)}
            today={today}
            locked={isDayLocked(selectedDate)}
          />
        </>
      ) : (
        <div>
          {agendaDates.map((date) => (
            <CalendarDaySection
              key={date}
              date={date}
              entries={entriesOf(date)}
              today={today}
              locked={isDayLocked(date)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
