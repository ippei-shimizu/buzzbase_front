import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getMenuSets } from "@app/services/v2/menuSetService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { getSchedules } from "@app/services/v2/scheduleService";
import { todayString } from "../../../record/_utils/practiceRecordDraft";
import { LOAD_ERROR } from "../../_components/scheduleCopy";
import ScheduleFormContent from "../../_components/ScheduleFormContent";

export const metadata = {
  title: "予定を編集",
};

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { id } = await params;
  const scheduleId = Number(id);
  if (!Number.isInteger(scheduleId)) notFound();

  const [schedulesResult, menusResult, menuSetsResult] = await Promise.all([
    getSchedules(),
    getPracticeMenus(),
    getMenuSets(),
  ]);

  const schedule =
    schedulesResult.status === "ok"
      ? (schedulesResult.data.find((item) => item.id === scheduleId) ?? null)
      : null;
  if (schedulesResult.status === "ok" && schedule === null) notFound();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="mb-6 text-2xl font-bold">予定を編集</h2>
            {schedule ? (
              <ScheduleFormContent
                schedule={schedule}
                menus={menusResult.status === "ok" ? menusResult.data : []}
                menuSets={
                  menuSetsResult.status === "ok" ? menuSetsResult.data : []
                }
                today={todayString()}
              />
            ) : (
              // 取得失敗を「予定なし」に丸めると、空のフォームで既存の予定を上書きしてしまう。
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
