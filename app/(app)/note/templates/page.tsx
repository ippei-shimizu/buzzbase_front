import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBackTo from "@app/components/header/HeaderBackTo";
import { NOTE_LIST_PATH } from "@app/constants/note";
import { getReflectionTemplates } from "@app/services/v2/reflectionTemplateService";
import ReflectionTemplatesContent from "./_components/ReflectionTemplatesContent";

export const metadata = {
  title: "振り返りテンプレ",
};

export default async function ReflectionTemplatesPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const result = await getReflectionTemplates();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBackTo href={NOTE_LIST_PATH} label="野球ノートに戻る" />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-[74px] px-4 lg:px-6">
            {result.status === "ok" ? (
              <ReflectionTemplatesContent initialTemplates={result.data} />
            ) : (
              // 取得失敗を空配列に丸めると「テンプレ未登録」と誤表示し、重複作成を招く。
              <p className="py-8 text-center text-sm text-zinc-400">
                振り返りテンプレを取得できませんでした。時間を置いて再度お試しください。
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
