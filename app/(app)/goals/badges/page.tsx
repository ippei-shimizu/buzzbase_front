import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getGoalBadges } from "@app/services/v2/goalService";
import {
  BADGES_DESCRIPTION,
  BADGES_LOAD_ERROR_MESSAGE,
  BADGES_TITLE,
} from "../_components/goalCopy";
import GoalBadgeList from "./_components/GoalBadgeList";

export const metadata = {
  title: BADGES_TITLE,
};

export default async function GoalBadgesPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const badgesResult = await getGoalBadges();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <Link
              href="/goals"
              className="inline-flex items-center gap-1 text-sm text-zinc-300"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
              目標
            </Link>
            <h2 className="mt-3 text-2xl font-bold">{BADGES_TITLE}</h2>
            <p className="mt-2 text-sm text-zinc-300">{BADGES_DESCRIPTION}</p>

            <div className="my-6">
              {badgesResult.status === "ok" ? (
                <GoalBadgeList badges={badgesResult.data} />
              ) : (
                // 取得失敗を空配列に丸めると「まだバッジが無い」と誤って伝わる。
                <p className="py-8 text-center text-sm text-zinc-400">
                  {BADGES_LOAD_ERROR_MESSAGE}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
