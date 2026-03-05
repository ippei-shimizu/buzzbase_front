import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import SeasonsContent from "./_components/SeasonsContent";
import { getSeasonsServer } from "./actions";

export const metadata = {
  title: "シーズン管理",
};

export default async function SeasonsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const seasons = await getSeasonsServer();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <SeasonsContent initialSeasons={seasons} />
          </div>
        </div>
      </main>
    </div>
  );
}
