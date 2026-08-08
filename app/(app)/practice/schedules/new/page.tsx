import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBack from "@app/components/header/HeaderBack";
import { getMenuSets } from "@app/services/v2/menuSetService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { todayString } from "../../record/_utils/practiceRecordDraft";
import ScheduleFormContent from "../_components/ScheduleFormContent";

export const metadata = {
  title: "予定を作る",
};

interface NewSchedulePageSearchParams {
  /** 単発予定の初期日付（YYYY-MM-DD）。カレンダーなど日付が確定した文脈からの遷移で使う。 */
  date?: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<NewSchedulePageSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const params = await searchParams;
  const [menusResult, menuSetsResult] = await Promise.all([
    getPracticeMenus(),
    getMenuSets(),
  ]);
  const initialDate =
    params.date && DATE_PATTERN.test(params.date) ? params.date : todayString();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBack />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="mb-6 text-2xl font-bold">予定を作る</h2>
            <ScheduleFormContent
              schedule={null}
              menus={menusResult.status === "ok" ? menusResult.data : []}
              menuSets={
                menuSetsResult.status === "ok" ? menuSetsResult.data : []
              }
              today={initialDate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
