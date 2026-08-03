import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { todayInTokyo } from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import Header from "@app/components/header/Header";
import { HOME_PAGE_TITLE } from "./_components/activity/activityCopy";
import ActivityView from "./_components/activity/ActivityView";
import DashboardContent from "./_components/DashboardContent";
import HomeTabBar from "./_components/HomeTabBar";
import { loadActivityData } from "./_utils/homeData";
import { parseHomeTab } from "./_utils/homeTab";
import { getAvailableSeasons, getDashboardData } from "./actions";

export const metadata = {
  title: HOME_PAGE_TITLE,
};

interface DashboardSearchParams {
  /** `dashboard` で成績のダッシュボード面。未指定・不正値は「練習・活動」面。 */
  tab?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { tab } = await searchParams;
  const isActivity = parseHomeTab(tab) === "activity";
  // 「今日」は back の集計と同じ Asia/Tokyo 基準で決める。実行環境のタイムゾーンに任せると
  // 日付が 1 日ずれ、当日の予定と「済」の判定日が食い違う。
  const today = todayInTokyo();

  // 表示しない面のデータは取りに行かない。面の中の取得は互いに独立なので並列で待つ。
  const [activity, dashboard, seasons] = await Promise.all([
    isActivity ? loadActivityData(today) : null,
    isActivity ? null : getDashboardData(),
    isActivity ? null : getAvailableSeasons(),
  ]);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="text-2xl font-bold">{HOME_PAGE_TITLE}</h2>
            <div className="mt-5">
              <HomeTabBar active={isActivity ? "activity" : "dashboard"} />
            </div>
            <div className="my-6">
              {activity ? (
                <ActivityView data={activity} today={today} />
              ) : (
                <div className="flex flex-col gap-6">
                  <DashboardContent data={dashboard} seasons={seasons ?? []} />
                  <AdInFeed
                    slot={adSlots.dashboardInFeed}
                    layoutKey="-6t+ed+2i-1n-4w"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
