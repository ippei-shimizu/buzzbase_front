import type { Schedule } from "@app/types/schedule";
import Link from "next/link";
import { dayLabels, eventTypeMeta } from "@app/constants/schedule";
import {
  EMPTY_MESSAGE,
  RECURRING_SECTION_TITLE,
  SINGLE_SECTION_TITLE,
} from "./scheduleCopy";

interface ScheduleListProps {
  schedules: Schedule[];
}

/** 予定の「いつ」を1行で表す。毎週は曜日、単発は日付。 */
function whenLabel(schedule: Schedule): string {
  if (schedule.days_of_week) return `毎週 ${dayLabels(schedule.days_of_week)}`;
  return schedule.planned_on ?? "";
}

function ScheduleRow({ schedule }: { schedule: Schedule }) {
  const meta = eventTypeMeta(schedule.event_type);

  return (
    <li>
      <Link
        href={`/practice/schedules/${schedule.id}`}
        className="flex items-center gap-3 rounded-[10px] bg-sub px-3.5 py-3 transition-opacity hover:opacity-90"
      >
        <span
          aria-hidden
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-white">
            {schedule.title ?? meta.label}
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            {whenLabel(schedule)}
            {schedule.scheduled_time ? ` ${schedule.scheduled_time}` : ""}
          </span>
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

function Section({
  title,
  schedules,
}: {
  title: string;
  schedules: Schedule[];
}) {
  if (schedules.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold text-zinc-400">{title}</h3>
      <ul className="flex flex-col gap-2">
        {schedules.map((schedule) => (
          <ScheduleRow key={schedule.id} schedule={schedule} />
        ))}
      </ul>
    </section>
  );
}

/**
 * 予定一覧の Presentational。
 * 繰り返しと単発は意味が違う（毎週続く／その日限り）ため節を分けて並べる。
 */
export default function ScheduleList({ schedules }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">{EMPTY_MESSAGE}</p>
    );
  }

  const recurring = schedules.filter((schedule) => schedule.recurring);
  const single = schedules
    .filter((schedule) => !schedule.recurring)
    .sort((a, b) => (a.planned_on ?? "").localeCompare(b.planned_on ?? ""));

  return (
    <div className="flex flex-col gap-6">
      <Section title={SINGLE_SECTION_TITLE} schedules={single} />
      <Section title={RECURRING_SECTION_TITLE} schedules={recurring} />
    </div>
  );
}
