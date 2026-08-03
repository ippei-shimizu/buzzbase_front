import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  addDays,
  todayInTokyo,
} from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import Header from "@app/components/header/Header";
import { GRASS_HISTORY_DAYS } from "@app/constants/activity";
import {
  getActivityHeatmap,
  getShadowSwingStats,
} from "@app/services/v2/activityService";
import { getPeriodicReviews } from "@app/services/v2/periodicReviewService";
import ActivityGrassSection from "./_components/ActivityGrassSection";
import DashboardContent from "./_components/DashboardContent";
import PeriodicReviewBanner from "./_components/PeriodicReviewBanner";
import { getAvailableSeasons, getDashboardData } from "./actions";

export const metadata = {
  title: "ダッシュボード",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  // 草グラフは今日を含む 1 年ぶんを要求する。無料プランでは back が直近30日へ
  // クランプして返すため、要求した開始日を Container へ渡してクランプを検出させる。
  const today = todayInTokyo();
  const grassFrom = addDays(today, -(GRASS_HISTORY_DAYS - 1));

  const [data, seasons, reviews, heatmap, swingStats] = await Promise.all([
    getDashboardData(),
    getAvailableSeasons(),
    getPeriodicReviews(),
    getActivityHeatmap(grassFrom, today),
    getShadowSwingStats(),
  ]);

  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <Header />
        <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
            <div className="pt-20 px-4 lg:px-6">
              <h2 className="text-2xl font-bold">ダッシュボード</h2>
              <div className="my-6 flex flex-col gap-6">
                <PeriodicReviewBanner result={reviews} />
                <ActivityGrassSection
                  today={today}
                  requestedFrom={grassFrom}
                  heatmap={heatmap}
                  swingStats={swingStats}
                />
                <DashboardContent data={data} seasons={seasons} />
                <AdInFeed
                  slot={adSlots.dashboardInFeed}
                  layoutKey="-6t+ed+2i-1n-4w"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
