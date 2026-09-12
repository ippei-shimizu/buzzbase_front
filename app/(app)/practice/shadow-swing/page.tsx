import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getShadowSwingStats } from "@app/services/v2/shadowSwingService";
import ShadowSwingContent from "./_components/ShadowSwingContent";
import { PAGE_TITLE } from "./_components/shadowSwingCopy";

export const metadata = {
  title: "素振りカウンター",
};

export default async function ShadowSwingPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const statsResult = await getShadowSwingStats();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
            <div className="my-6">
              <ShadowSwingContent initialStatsResult={statsResult} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
