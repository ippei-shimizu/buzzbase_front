import type { StatsPeriod } from "./actions";
import AuthRequiredOverlay from "@app/components/auth/AuthRequiredOverlay";
import Header from "@app/components/header/Header";
import StatsContainer from "./_components/StatsContainer";
import {
  getBattingStats,
  getIsAuthenticated,
  getPitchingStats,
} from "./actions";

export const metadata = {
  title: "成績 | BUZZ BASE",
  description: "打撃成績・投手成績を年別・月別・日別で確認できます。",
  robots: { index: false },
};

type ActiveTab = "batting" | "pitching";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; period?: string }>;
}) {
  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="buzz-dark min-h-full max-w-[720px] mx-auto w-full lg:m-[0_auto_0_28%]">
          <div className="pt-20 px-4">
            <AuthRequiredOverlay message="成績を閲覧するにはログインが必要です" />
          </div>
        </main>
      </>
    );
  }

  const params = await searchParams;
  const tab: ActiveTab = params.tab === "pitching" ? "pitching" : "batting";
  const period: StatsPeriod =
    params.period === "monthly"
      ? "monthly"
      : params.period === "daily"
        ? "daily"
        : "yearly";

  const rows =
    tab === "batting"
      ? await getBattingStats(period)
      : await getPitchingStats(period);

  return (
    <>
      <Header />
      <main className="buzz-dark min-h-full max-w-[720px] mx-auto w-full lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-12 px-4 lg:px-6 lg:pb-6">
            <StatsContainer tab={tab} period={period} rows={rows} />
          </div>
        </div>
      </main>
    </>
  );
}
