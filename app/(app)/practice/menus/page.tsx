import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBack from "@app/components/header/HeaderBack";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import PracticeMenusContent from "./_components/PracticeMenusContent";
import { resolveReturnTo } from "./_utils/returnTo";

export const metadata = {
  title: "練習メニュー",
};

interface PracticeMenusSearchParams {
  /** 登録完了後に戻る画面。練習記録画面等からメニュー未登録で誘導された場合に渡される。 */
  returnTo?: string;
}

export default async function PracticeMenusPage({
  searchParams,
}: {
  searchParams: Promise<PracticeMenusSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { returnTo } = await searchParams;
  const result = await getPracticeMenus();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBack />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-[74px] px-4 lg:px-6">
            {result.status === "ok" ? (
              <PracticeMenusContent
                initialMenus={result.data}
                returnTo={resolveReturnTo(returnTo)}
              />
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
