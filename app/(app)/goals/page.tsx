import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import {
  getGoalBadges,
  getGoalHistory,
  getGoals,
} from "@app/services/v2/goalService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import AchievementSummaryModal from "./_components/AchievementSummaryModal";
import { LOAD_ERROR_MESSAGE } from "./_components/goalCopy";
import GoalsContent from "./_components/GoalsContent";
import { previousMonthKey } from "./_utils/achievementSummary";
import { todayString } from "./_utils/goalForm";
import { getGoalSeasonOptions, getGoalTournamentOptions } from "./actions";

export const metadata = {
  title: "目標",
};

export default async function GoalsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const [
    goalsResult,
    historyResult,
    badgesResult,
    seasonsResult,
    tournamentsResult,
    menus,
  ] = await Promise.all([
    getGoals(),
    getGoalHistory(),
    getGoalBadges(),
    getGoalSeasonOptions(),
    getGoalTournamentOptions(),
    getPracticeMenus(),
  ]);

  const history = historyResult.status === "ok" ? historyResult.data : [];
  // 履歴が取れていないと「N件中M件」が実際より少なく出るため、その月は振り返りを出さない。
  const summaryMonthKey =
    historyResult.status === "ok" ? previousMonthKey() : null;

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            {goalsResult.status === "ok" ? (
              <GoalsContent
                initialGoals={goalsResult.data}
                initialHistory={history}
                historyLoadFailed={historyResult.status !== "ok"}
                seasons={
                  seasonsResult.status === "ok" ? seasonsResult.data : []
                }
                tournaments={
                  tournamentsResult.status === "ok"
                    ? tournamentsResult.data
                    : []
                }
                menus={menus.status === "ok" ? menus.data : []}
                today={todayString()}
              />
            ) : (
              // 取得失敗を空配列に丸めると「目標が未設定」と誤表示し、同じ目標の重複作成を招く。
              <p className="py-8 text-center text-sm text-zinc-400">
                {LOAD_ERROR_MESSAGE}
              </p>
            )}
          </div>
        </div>
      </main>

      {summaryMonthKey !== null ? (
        <AchievementSummaryModal
          monthKey={summaryMonthKey}
          history={history}
          badges={badgesResult.status === "ok" ? badgesResult.data : []}
        />
      ) : null}
    </div>
  );
}
