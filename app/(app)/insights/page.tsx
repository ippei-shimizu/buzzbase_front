import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getCorrelationInsights } from "@app/services/v2/correlationInsightService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { PAGE_TITLE } from "./_components/insightCopy";
import InsightsContent from "./_components/InsightsContent";

export const metadata = {
  title: PAGE_TITLE,
};

export default async function InsightsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  // 練習メニューは作成フォームの選択肢にしか使わないため、一覧の取得と並列に取る。
  const [insightsResult, menusResult] = await Promise.all([
    getCorrelationInsights(),
    getPracticeMenus(),
  ]);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="text-2xl font-bold">{PAGE_TITLE}</h2>

            <div className="mt-4 mb-6">
              <InsightsContent
                result={insightsResult}
                practiceMenus={
                  menusResult.status === "ok" ? menusResult.data : []
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
