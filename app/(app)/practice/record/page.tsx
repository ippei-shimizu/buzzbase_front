import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getImprovementThemes } from "@app/services/v2/improvementThemeService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { getPracticeSessionByDate } from "@app/services/v2/practiceSessionService";
import PracticeRecordContent from "./_components/PracticeRecordContent";
import {
  parsePresetMenus,
  resolveInitialDate,
  todayString,
} from "./_utils/practiceRecordDraft";

export const metadata = {
  title: "練習を記録する",
};

interface PracticeRecordSearchParams {
  /** 記録する日（YYYY-MM-DD）。未指定・不正・未来日は今日にフォールバックする。 */
  date?: string;
  /** 事前選択するメニューの JSON 配列（[{ practice_menu_id, target_value }]）。 */
  presetMenus?: string;
}

export default async function PracticeRecordPage({
  searchParams,
}: {
  searchParams: Promise<PracticeRecordSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const params = await searchParams;
  const today = todayString();
  const initialDate = resolveInitialDate(params.date, today);

  const [menusResult, sessionResult, themesResult] = await Promise.all([
    getPracticeMenus(),
    getPracticeSessionByDate(initialDate),
    getImprovementThemes({ status: "open" }),
  ]);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            {menusResult.status === "ok" ? (
              <PracticeRecordContent
                today={today}
                initialDate={initialDate}
                menus={menusResult.data}
                initialSession={
                  sessionResult.status === "ok" ? sessionResult.data : null
                }
                initialLoadFailed={sessionResult.status !== "ok"}
                presetMenus={parsePresetMenus(params.presetMenus)}
                themes={themesResult.status === "ok" ? themesResult.data : []}
              />
            ) : (
              // 取得失敗を空配列に丸めるとメニュー未登録の空状態を誤表示してしまう。
              <p className="py-8 text-center text-sm text-zinc-400">
                練習メニューを取得できませんでした。時間を置いて再度お試しください。
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
