import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import DashboardContent from "./_components/DashboardContent";
import { getDashboardData } from "./actions";

export const metadata = {
  title: "ダッシュボード",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const data = await getDashboardData();

  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <Header />
        <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
            <div className="pt-20 px-4 lg:px-6">
              <h2 className="text-2xl font-bold">ダッシュボード</h2>
              <div className="my-6">
                <DashboardContent data={data} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
