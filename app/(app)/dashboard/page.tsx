import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { todayInTokyo } from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import Header from "@app/components/header/Header";
import { getPeriodicReviews } from "@app/services/v2/periodicReviewService";
import { getDayPlan } from "@app/services/v2/planService";
import DashboardContent from "./_components/DashboardContent";
import PeriodicReviewBanner from "./_components/PeriodicReviewBanner";
import TodayTasksSection from "./_components/TodayTasksSection";
import { getAvailableSeasons, getDashboardData } from "./actions";

export const metadata = {
  title: "ダッシュボード",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  // 「今日」は back の集計と同じ Asia/Tokyo 基準で決める。実行環境のタイムゾーンに任せると
  // 日付が 1 日ずれ、当日の予定と「済」の判定日が食い違う。
  const today = todayInTokyo();
  const [data, seasons, reviews, todayPlans] = await Promise.all([
    getDashboardData(),
    getAvailableSeasons(),
    getPeriodicReviews(),
    getDayPlan(today),
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
                <TodayTasksSection today={today} result={todayPlans} />
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
