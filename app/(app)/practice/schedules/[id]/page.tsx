import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import HeaderBackTo from "@app/components/header/HeaderBackTo";
import { getPracticeLogs } from "@app/services/v2/practiceLogService";
import { getSchedules } from "@app/services/v2/scheduleService";
import { todayString } from "../../record/_utils/practiceRecordDraft";
import { LOAD_ERROR } from "../_components/scheduleCopy";
import { buildDoneLogIds, resolveContextDate } from "../_utils/scheduleRecord";
import ScheduleDetailContent from "./_components/ScheduleDetailContent";

export const metadata = {
  title: "予定の詳細",
};

interface ScheduleDetailSearchParams {
  /** 「済」を判定する日（YYYY-MM-DD）。毎週の予定をカレンダー等から開くときに使う。 */
  date?: string;
}

export default async function ScheduleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ScheduleDetailSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const scheduleId = Number(id);
  if (!Number.isInteger(scheduleId)) notFound();

  const schedulesResult = await getSchedules();
  if (schedulesResult.status !== "ok") {
    return (
      <PageShell>
        <p className="py-8 text-center text-sm text-zinc-400">{LOAD_ERROR}</p>
      </PageShell>
    );
  }

  const schedule = schedulesResult.data.find((item) => item.id === scheduleId);
  if (!schedule) notFound();

  const contextDate = resolveContextDate(query.date, schedule, todayString());
  const logsResult = await getPracticeLogs({
    from: contextDate,
    to: contextDate,
  });

  return (
    <PageShell>
      <ScheduleDetailContent
        schedule={schedule}
        contextDate={contextDate}
        initialDoneLogIds={
          logsResult.status === "ok"
            ? buildDoneLogIds(logsResult.data, schedule.id)
            : {}
        }
        logsLoadFailed={logsResult.status !== "ok"}
      />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBackTo href="/dashboard" label="ホームに戻る" />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
