import AuthRequiredOverlay from "@app/components/auth/AuthRequiredOverlay";
import Header from "@app/components/header/Header";
import { AnalysisSection } from "./_components/analysis/AnalysisSection";
import StatsContainer from "./_components/StatsContainer";
import { getBattingStats, getIsAuthenticated } from "./actions";

export const metadata = {
  title: "成績 | BUZZ BASE",
  description: "打撃成績・投手成績を年別・月別・日別で確認できます。",
  robots: { index: false },
};

export default async function StatsPage() {
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

  // タブ/期間/フィルタの切替はクライアント側 state で行うため、ここでは
  // デフォルト（打撃・年別）の初期データのみ SSR で取得して渡す。
  const initialRows = await getBattingStats("yearly");

  return (
    <>
      <Header />
      <main className="buzz-dark min-h-full max-w-[720px] mx-auto w-full lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-12 px-4 lg:px-6 lg:pb-6">
            <StatsContainer
              initialRows={initialRows}
              analysisSlot={<AnalysisSection />}
            />
          </div>
        </div>
      </main>
    </>
  );
}
