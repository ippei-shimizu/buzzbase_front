"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { Schedule } from "@app/types/schedule";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import ChevronLeftIcon from "@heroicons/react/24/outline/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  addDays,
  startOfWeek,
  weekdayNumber,
} from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { WEEK_DAYS, eventTypeMeta } from "@app/constants/schedule";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { copyScheduleWeekToNext } from "@app/services/v2/scheduleService";
import { formatDayLabel } from "../../calendar/_components/CalendarDaySection";
import {
  addPlanHref,
  entryHref,
} from "../../calendar/_components/CalendarEntryRow";
import {
  mergeSchedules,
  nextWeekStart,
  singleSchedulesByDate,
  weekDates,
  weekRangeLabel,
} from "../_utils/weeklyPlan";
import {
  ADD_PLAN_LABEL,
  COPY_EMPTY_MESSAGE,
  COPY_FORBIDDEN_MESSAGE,
  COPY_LABEL,
  COPY_PAYWALL_DESCRIPTION,
  COPY_PAYWALL_TITLE,
  COPY_RUNNING_LABEL,
  EMPTY_DAY_LABEL,
  LOAD_ERROR,
  NEXT_WEEK_LABEL,
  PREV_WEEK_LABEL,
  RECURRING_NOTICE,
  THIS_WEEK_LABEL,
  copiedMessage,
} from "./weeklyPlanCopy";

const FEATURE = "schedule_copy_next_week" as const;

/** 曜日の短いラベル（月〜日）。番号は月=1〜日=7 で、JS の getDay（日=0）とは別体系。 */
function shortWeekdayLabel(iso: string): string {
  return WEEK_DAYS.find((day) => day.num === weekdayNumber(iso))?.label ?? "";
}

interface WeeklyPlanContentProps {
  /** Asia/Tokyo の今日。「今週」への復帰と当日の強調に使う。 */
  today: string;
  /** Server Component が取得した予定一覧（繰り返し・単発が混在）。 */
  result: FetchResult<Schedule[]>;
}

/**
 * 週の練習プランの Container。
 *
 * 予定一覧は Server Component が一度に取得済みなので、週の前後移動では再取得しない。
 * 「来週にコピー」は Pro 限定（schedule_copy_next_week）で、成功して 1 件以上作られたときだけ
 * 表示週を翌週へ送る。0 件のときに週を送ると「コピーされた」と誤解させるため送らない。
 */
export default function WeeklyPlanContent({
  today,
  result,
}: WeeklyPlanContentProps) {
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [schedules, setSchedules] = useState<Schedule[]>(
    result.status === "ok" ? result.data : [],
  );
  const [isCopying, setIsCopying] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);

  // isCopying の反映を待たずに 2 回目の送信が走るのを防ぐ（連打で予定が二重に増えないように）。
  const isCopyingRef = useRef(false);

  const dates = weekDates(weekStart);
  const byDate = singleSchedulesByDate(schedules, weekStart);

  // Pro 判定が未確定の間はロック表示にしない。先に無料前提で描くと、
  // 加入済みユーザーに一瞬だけ鍵アイコンが見えてしまう。
  const isCopyLocked = !isEntitlementLoading && !hasEntitlement(FEATURE);

  const moveWeek = (nextStart: string) => {
    setWeekStart(nextStart);
    setCopyNotice(null);
  };

  const showPaywall = (message: string) => {
    setCopyNotice(message);
    setIsPaywallVisible(true);
  };

  const handleCopy = async () => {
    if (isCopyingRef.current) return;
    if (isCopyLocked) {
      showPaywall(COPY_FORBIDDEN_MESSAGE);
      return;
    }

    isCopyingRef.current = true;
    setIsCopying(true);
    setCopyNotice(null);
    const copied = await copyScheduleWeekToNext(weekStart);
    isCopyingRef.current = false;
    setIsCopying(false);

    if (!copied.ok) {
      // back の entitlement 判定が正。front の Pro 判定が古くても、403 は Pro 限定として案内する。
      if (copied.reason === "forbidden") {
        showPaywall(COPY_FORBIDDEN_MESSAGE);
        return;
      }
      toast.error(copied.errors[0]);
      return;
    }

    // 201 でも作成 0 件のことがある（コピー元が空、または既にコピー済み）。
    if (copied.data.length === 0) {
      setCopyNotice(COPY_EMPTY_MESSAGE);
      return;
    }

    setSchedules((previous) => mergeSchedules(previous, copied.data));
    toast.success(copiedMessage(copied.data.length));
    moveWeek(nextWeekStart(weekStart));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={PREV_WEEK_LABEL}
          onClick={() => moveWeek(addDays(weekStart, -7))}
          className="rounded-full p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden />
        </button>
        <p
          data-testid="week-range-label"
          aria-live="polite"
          className="text-base font-bold text-white"
        >
          {weekRangeLabel(weekStart)}
        </p>
        <button
          type="button"
          aria-label={NEXT_WEEK_LABEL}
          onClick={() => moveWeek(addDays(weekStart, 7))}
          className="rounded-full p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
        >
          <ChevronRightIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => moveWeek(startOfWeek(today))}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:border-[#d08000] hover:text-[#d08000]"
        >
          {THIS_WEEK_LABEL}
        </button>
      </div>

      {result.status !== "ok" ? (
        // 取得失敗を空表示に丸めると「予定なし」と誤読され、重複登録を招く。
        <p role="alert" className="py-8 text-center text-sm text-zinc-400">
          {LOAD_ERROR}
        </p>
      ) : (
        <ul className="flex flex-col">
          {dates.map((date) => {
            const dayLabel = formatDayLabel(date);
            const entries = byDate.get(date) ?? [];
            return (
              <li
                key={date}
                data-testid={`week-day-${date}`}
                className="flex items-start gap-3 border-b border-zinc-700 py-2.5 last:border-b-0"
              >
                <div className="w-9 shrink-0 text-center">
                  <p
                    className={`text-sm font-bold ${date === today ? "text-[#d08000]" : "text-white"}`}
                  >
                    {shortWeekdayLabel(date)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {Number(date.slice(8, 10))}
                  </p>
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  {entries.length === 0 ? (
                    <span aria-hidden className="text-xs text-zinc-600">
                      {EMPTY_DAY_LABEL}
                    </span>
                  ) : (
                    entries.map((schedule) => {
                      const meta = eventTypeMeta(schedule.event_type);
                      return (
                        <Link
                          key={schedule.id}
                          href={entryHref({
                            date,
                            event_type: schedule.event_type,
                            title: schedule.title,
                            schedule_id: schedule.id,
                          })}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-sub px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
                        >
                          <span
                            aria-hidden
                            data-testid="week-chip-dot"
                            data-event-type={schedule.event_type}
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="truncate">
                            {schedule.title ?? meta.label}
                          </span>
                        </Link>
                      );
                    })
                  )}
                  <Link
                    href={addPlanHref(date)}
                    aria-label={`${dayLabel} ${ADD_PLAN_LABEL}`}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d08000] text-[#d08000] transition-colors hover:bg-[#d08000]/10"
                  >
                    <PlusIcon className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={handleCopy}
        disabled={isCopying}
        className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-sub px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <ArrowPathIcon className="h-4 w-4 shrink-0" aria-hidden />
        {isCopying ? COPY_RUNNING_LABEL : COPY_LABEL}
        {isCopyLocked ? (
          <LockClosedIcon
            data-testid="copy-lock-icon"
            className="h-3.5 w-3.5 shrink-0 text-zinc-400"
            aria-hidden
          />
        ) : null}
      </button>

      {copyNotice ? (
        <p role="status" className="text-xs text-zinc-300">
          {copyNotice}
        </p>
      ) : null}

      {isPaywallVisible ? (
        <ProUpsellCard
          feature={FEATURE}
          title={COPY_PAYWALL_TITLE}
          description={COPY_PAYWALL_DESCRIPTION}
        />
      ) : null}

      <p className="text-xs text-zinc-500">{RECURRING_NOTICE}</p>
    </div>
  );
}
