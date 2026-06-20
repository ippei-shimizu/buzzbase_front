import AuthRequiredOverlay from "@app/components/auth/AuthRequiredOverlay";
import Header from "@app/components/header/Header";
import { AnalysisContainer } from "../_components/analysis/AnalysisContainer";
import { getIsAuthenticated } from "../actions";

export const metadata = {
  title: "打撃分析 | BUZZ BASE",
  description: "打球分布・打球方向・主要スタッツなどの打撃分析を確認できます。",
  robots: { index: false },
};

export default async function BattingAnalysisPage() {
  const isAuthenticated = await getIsAuthenticated();

  return (
    <>
      <Header />
      <main className="min-h-full max-w-[720px] mx-auto w-full lg:m-[0_auto_0_28%]">
        <div className="pt-20 px-4 pb-32">
          {isAuthenticated ? (
            <>
              <h1 className="text-xl font-bold mb-6">打撃分析</h1>
              <AnalysisContainer />
            </>
          ) : (
            <AuthRequiredOverlay message="分析を閲覧するにはログインが必要です" />
          )}
        </div>
      </main>
    </>
  );
}
