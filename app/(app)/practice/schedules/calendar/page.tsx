import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getPlanCalendar } from "@app/services/v2/planService";
import { PAGE_TITLE as SCHEDULES_PAGE_TITLE } from "../_components/scheduleCopy";
import { PAGE_DESCRIPTION, PAGE_TITLE } from "./_components/calendarCopy";
import PlanCalendarContent from "./_components/PlanCalendarContent";
import { fetchRange, todayInTokyo } from "./_utils/calendarDate";

export const metadata = {
  title: PAGE_TITLE,
};

export default async function PlanCalendarPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  // 初期表示は「今日」を含む月。取得範囲を Container と同じ純粋関数で決めることで、
  // ハイドレーション後に同じ範囲をもう一度取りに行かずに済む。
  const today = todayInTokyo();
  const initialRange = fetchRange(today);
  const initialResult = await getPlanCalendar(
    initialRange.from,
    initialRange.to,
  );

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:max-w-[900px] lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="text-2xl font-bold">{PAGE_TITLE}</h2>
            <p className="mt-2 text-sm text-zinc-300">{PAGE_DESCRIPTION}</p>

            <div className="my-6">
              <PlanCalendarContent
                today={today}
                initialRange={initialRange}
                initialResult={initialResult}
              />
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
