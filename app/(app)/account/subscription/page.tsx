import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCachedProStatus } from "@app/(app)/pro/proStatus";
import Header from "@app/components/header/Header";
import SubscriptionLoadError from "./_components/SubscriptionLoadError";
import SubscriptionOverview from "./_components/SubscriptionOverview";

export const metadata: Metadata = {
  title: "サブスクリプション管理",
  robots: { index: false },
};

export default async function AccountSubscriptionPage() {
  const cookieStore = await cookies();
  const hasAuthCookies =
    Boolean(cookieStore.get("access-token")) &&
    Boolean(cookieStore.get("client")) &&
    Boolean(cookieStore.get("uid"));
  if (!hasAuthCookies) {
    redirect("/signup?auth_required=true");
  }

  // 認証済みで null が返るのは API 障害かトークン失効。無料状態にフォールバックすると
  // 課金中のユーザーに未加入と誤表示するため、取得失敗として扱う。
  const proStatus = await getCachedProStatus();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h1 className="text-2xl font-bold text-white">
              サブスクリプション管理
            </h1>
            <div className="my-6">
              {proStatus ? (
                <SubscriptionOverview subscription={proStatus.subscription} />
              ) : (
                <SubscriptionLoadError />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
