import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { CalendarIcon } from "@app/components/icon/CalendarIcon";
import { getSchedules } from "@app/services/v2/scheduleService";
import {
  CALENDAR_LABEL,
  CREATE_LABEL,
  LOAD_ERROR,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from "./_components/scheduleCopy";
import ScheduleList from "./_components/ScheduleList";

export const metadata = {
  title: "練習スケジュール",
};

export default async function SchedulesPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const result = await getSchedules();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-bold">{PAGE_TITLE}</h2>
              <Link
                href="/practice/schedules/calendar"
                className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:border-[#d08000] hover:text-[#d08000]"
              >
                <CalendarIcon fill="currentColor" width="14" height="14" />
                {CALENDAR_LABEL}
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-300">{PAGE_DESCRIPTION}</p>

            <div className="my-6">
              {result.status === "ok" ? (
                <ScheduleList schedules={result.data} />
              ) : (
                // 取得失敗を空配列に丸めると「予定なし」と誤表示し、重複登録を招く。
                <p className="py-8 text-center text-sm text-zinc-400">
                  {LOAD_ERROR}
                </p>
              )}
            </div>

            <Link
              href="/practice/schedules/new"
              className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#d08000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <PlusIcon className="h-5 w-5" aria-hidden />
              {CREATE_LABEL}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
