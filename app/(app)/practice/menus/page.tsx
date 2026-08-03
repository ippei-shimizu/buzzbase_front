import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import PracticeMenusContent from "./_components/PracticeMenusContent";

export const metadata = {
  title: "練習メニュー",
};

export default async function PracticeMenusPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const result = await getPracticeMenus();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            {result.status === "ok" ? (
              <PracticeMenusContent initialMenus={result.data} />
            ) : (
              // 取得失敗を空配列に丸めると「メニュー未登録」と誤表示し、重複作成を招く。
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
