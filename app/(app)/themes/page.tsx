import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBackTo from "@app/components/header/HeaderBackTo";
import { getImprovementThemes } from "@app/services/v2/improvementThemeService";
import { LOAD_ERROR_MESSAGE } from "./_components/themeCopy";
import ThemesContent from "./_components/ThemesContent";

export const metadata = {
  title: "課題",
};

export default async function ThemesPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const result = await getImprovementThemes();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBackTo href="/dashboard" label="ホームに戻る" />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-[74px] px-4 lg:px-6">
            {result.status === "ok" ? (
              <ThemesContent initialThemes={result.data} />
            ) : (
              // 取得失敗を空配列に丸めると「課題が未設定」と誤表示し、同じ課題の重複作成を招く。
              <p className="py-8 text-center text-sm text-zinc-400">
                {LOAD_ERROR_MESSAGE}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
