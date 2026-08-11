import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBackTo from "@app/components/header/HeaderBackTo";
import { getMenuSets } from "@app/services/v2/menuSetService";
import { getPlanCalendar } from "@app/services/v2/planService";
import { getSchedules } from "@app/services/v2/scheduleService";
import { LOAD_ERROR as MENU_SET_LOAD_ERROR } from "../menu-sets/_components/menuSetCopy";
import MenuSetsContent from "../menu-sets/_components/MenuSetsContent";
import PlanCalendarContent from "../schedules/calendar/_components/PlanCalendarContent";
import {
  fetchRange,
  todayInTokyo,
} from "../schedules/calendar/_utils/calendarDate";
import WeeklyPlanContent from "../schedules/week/_components/WeeklyPlanContent";
import PlansSwipeArea from "./_components/PlansSwipeArea";
import PlansTabBar from "./_components/PlansTabBar";
import { parsePlanTab } from "./_utils/planTab";

export const metadata = {
  title: "練習プラン",
};

interface PlansSearchParams {
  /** `week` / `calendar` で該当の面。未指定・不正値は練習プランセット。 */
  tab?: string;
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<PlansSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { tab } = await searchParams;
  const activeTab = parsePlanTab(tab);
  const today = todayInTokyo();
  // 表示しない面のデータは取りに行かない。
  const initialRange = fetchRange(today);
  const [menuSetsResult, schedulesResult, calendarResult] = await Promise.all([
    activeTab === "sets" ? getMenuSets() : null,
    activeTab === "week" ? getSchedules() : null,
    activeTab === "calendar"
      ? getPlanCalendar(initialRange.from, initialRange.to)
      : null,
  ]);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBackTo href="/dashboard" label="ホームに戻る" />
      <main className="h-full w-full max-w-[720px] mx-auto lg:max-w-[900px] lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-[46px] px-4 lg:px-6">
            <PlansSwipeArea active={activeTab}>
              <PlansTabBar active={activeTab} />
              <div className="my-6">
                {menuSetsResult ? (
                  menuSetsResult.status === "ok" ? (
                    <MenuSetsContent menuSets={menuSetsResult.data} />
                  ) : (
                    // 取得失敗を空配列に丸めると「セット未登録」と誤表示し、無料枠の判定も甘くなる。
                    <p className="py-8 text-center text-sm text-zinc-400">
                      {MENU_SET_LOAD_ERROR}
                    </p>
                  )
                ) : null}
                {schedulesResult ? (
                  <WeeklyPlanContent today={today} result={schedulesResult} />
                ) : null}
                {calendarResult ? (
                  <PlanCalendarContent
                    today={today}
                    initialRange={initialRange}
                    initialResult={calendarResult}
                    swipeEnabled={false}
                  />
                ) : null}
              </div>
            </PlansSwipeArea>
          </div>
        </div>
      </main>
    </div>
  );
}
