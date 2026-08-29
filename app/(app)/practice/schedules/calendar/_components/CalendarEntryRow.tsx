import type { CalendarEntry } from "@app/types/plan";
import Link from "next/link";
import { eventTypeMeta } from "@app/constants/schedule";

/**
 * カレンダーから開く予定詳細のリンク先。
 * 毎週の予定は「どの日として開いたか」で「済」の判定日が変わるため、date を必ず引き継ぐ。
 */
export function entryHref(entry: CalendarEntry): string {
  return `/practice/schedules/${entry.schedule_id}?date=${entry.date}`;
}

/** 予定を追加する画面へのリンク先。日付が確定した文脈から開くので初期日付を渡す。 */
export function addPlanHref(date: string): string {
  return `/practice/schedules/new?date=${date}`;
}

/** 予定 1 件の行（種別色のバー + タイトル）。週表示・日表示・月表示の詳細欄で共用する。 */
export default function CalendarEntryRow({ entry }: { entry: CalendarEntry }) {
  const meta = eventTypeMeta(entry.event_type);

  return (
    <li>
      <Link
        href={entryHref(entry)}
        className="flex items-center gap-2.5 rounded-lg bg-sub px-3 py-2.5 transition-opacity hover:opacity-90"
      >
        <span
          aria-hidden
          data-testid="calendar-entry-bar"
          data-event-type={entry.event_type}
          className="h-5 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span className="min-w-0 flex-1 truncate text-sm text-white">
          {entry.title ?? meta.label}
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
        >
          {meta.label}
        </span>
      </Link>
    </li>
  );
}
