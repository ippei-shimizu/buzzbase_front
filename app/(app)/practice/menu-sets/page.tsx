import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getMenuSets } from "@app/services/v2/menuSetService";
import { LOAD_ERROR } from "./_components/menuSetCopy";
import MenuSetsContent from "./_components/MenuSetsContent";

export const metadata = {
  title: "メニューセット",
};

export default async function MenuSetsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const result = await getMenuSets();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            {result.status === "ok" ? (
              <MenuSetsContent menuSets={result.data} />
            ) : (
              // 取得失敗を空配列に丸めると「セット未登録」と誤表示し、無料枠の判定も甘くなる。
              <p className="py-8 text-center text-sm text-zinc-400">
                {LOAD_ERROR}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
