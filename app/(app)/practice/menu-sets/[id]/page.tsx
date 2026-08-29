import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getMenuSet } from "@app/services/v2/menuSetService";
import { LOAD_ERROR } from "../_components/menuSetCopy";
import MenuSetDetailContent from "./_components/MenuSetDetailContent";

export const metadata = {
  title: "セットの詳細",
};

export default async function MenuSetDetailPage({
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

  const result = await getMenuSet(menuSetId);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            {result.status === "ok" ? (
              <MenuSetDetailContent menuSet={result.data} />
            ) : (
              // 404（削除済み・他ユーザーのセット）も通信断も status:"error" に落ちるため、
              // notFound() には倒さず再試行を促す文言にする。
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
