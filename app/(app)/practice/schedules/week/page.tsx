import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { CalendarIcon } from "@app/components/icon/CalendarIcon";
import { getSchedules } from "@app/services/v2/scheduleService";
import {
  CALENDAR_LABEL,
  PAGE_TITLE as SCHEDULES_PAGE_TITLE,
} from "../_components/scheduleCopy";
import { todayInTokyo } from "../calendar/_utils/calendarDate";
import WeeklyPlanContent from "./_components/WeeklyPlanContent";
import { PAGE_DESCRIPTION, PAGE_TITLE } from "./_components/weeklyPlanCopy";

export const metadata = {
  title: PAGE_TITLE,
};

export default async function WeeklyPlanPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  // 予定は件数が少なく全件返るため、週の前後移動のたびに取り直さず一度で読み込む。
  const result = await getSchedules();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-[74px] px-4 lg:px-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{PAGE_TITLE}</h2>
              <Link
                href="/practice/schedules/calendar"
                className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:border-[#d08000] hover:text-[#d08000]"
              >
                <CalendarIcon fill="currentColor" width="14" height="14" />
                {CALENDAR_LABEL}
              </Link>
            </div>
            <p className="mt-2 text-xs text-zinc-300">{PAGE_DESCRIPTION}</p>

            <div className="my-6">
              <WeeklyPlanContent today={todayInTokyo()} result={result} />
            </div>

            <Link
              href="/practice/schedules"
              className="inline-block text-sm font-bold text-[#d08000] hover:opacity-80"
            >
              {SCHEDULES_PAGE_TITLE}へ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
