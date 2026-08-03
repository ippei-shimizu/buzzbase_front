import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getMenuSet } from "@app/services/v2/menuSetService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { EDIT_PAGE_TITLE, LOAD_ERROR } from "../../_components/menuSetCopy";
import MenuSetFormContent from "../../_components/MenuSetFormContent";

export const metadata = {
  title: "セットを編集",
};

export default async function EditMenuSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { id } = await params;
  const menuSetId = Number(id);
  if (!Number.isInteger(menuSetId)) notFound();

  const [menuSetResult, menusResult] = await Promise.all([
    getMenuSet(menuSetId),
    getPracticeMenus(),
  ]);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="mb-6 text-2xl font-bold">{EDIT_PAGE_TITLE}</h2>
            {menuSetResult.status === "ok" ? (
              <MenuSetFormContent
                menuSet={menuSetResult.data}
                menus={menusResult.status === "ok" ? menusResult.data : []}
              />
            ) : (
              // 取得失敗を空のフォームに丸めると、items 全置換で既存の中身を消してしまう。
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
