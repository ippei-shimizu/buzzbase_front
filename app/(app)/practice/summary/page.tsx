import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import {
  getMenuSummaries,
  getPracticeOverview,
} from "@app/services/v2/practiceSummaryService";
import MenuSummaryCard from "./_components/MenuSummaryCard";
import PracticeOverviewHeader from "./_components/PracticeOverviewHeader";
import {
  SUMMARY_EMPTY,
  SUMMARY_EMPTY_HINT,
  SUMMARY_LOAD_ERROR,
  SUMMARY_PAGE_DESCRIPTION,
  SUMMARY_PAGE_TITLE,
} from "./_components/practiceSummaryCopy";
import { buildMenuSummaryCards } from "./_utils/menuSummaryDisplay";

export const metadata = {
  title: SUMMARY_PAGE_TITLE,
  robots: { index: false },
};

export default async function PracticeSummaryPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  // 3つは互いに依存しないため並列で取得する。KPI は落ちても本体（カード）は出す。
  const [summariesResult, menusResult, overviewResult] = await Promise.all([
    getMenuSummaries(),
    getPracticeMenus(),
    getPracticeOverview(),
  ]);

  // メニュー一覧は未記録メニューの補完とカテゴリアイコンにだけ使うので、
  // 取得できなくてもサマリーは表示する。
  const menus = menusResult.status === "ok" ? menusResult.data : [];
  const cards =
    summariesResult.status === "ok"
      ? buildMenuSummaryCards(summariesResult.data, menus)
      : [];

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="text-2xl font-bold">{SUMMARY_PAGE_TITLE}</h2>
            <p className="mt-2 text-sm text-zinc-300">
              {SUMMARY_PAGE_DESCRIPTION}
            </p>

            {overviewResult.status === "ok" ? (
              <div className="mt-6">
                <PracticeOverviewHeader overview={overviewResult.data} />
              </div>
            ) : null}

            <div className="my-6 flex flex-col gap-3">
              {summariesResult.status !== "ok" ? (
                // 取得失敗を 0 件に丸めると「まだ記録がない」と誤って伝えてしまう。
                <p className="py-8 text-center text-sm text-zinc-400">
                  {SUMMARY_LOAD_ERROR}
                </p>
              ) : cards.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-semibold text-zinc-400">
                    {SUMMARY_EMPTY}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {SUMMARY_EMPTY_HINT}
                  </p>
                </div>
              ) : (
                cards.map((card) => (
                  <MenuSummaryCard key={card.key} card={card} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
