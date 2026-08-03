import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getPeriodicReviews } from "@app/services/v2/periodicReviewService";
import { PAGE_DESCRIPTION, PAGE_TITLE } from "./_components/periodicReviewCopy";
import PeriodicReviewList from "./_components/PeriodicReviewList";

export const metadata = {
  title: PAGE_TITLE,
};

export default async function ReviewPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const result = await getPeriodicReviews();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h2 className="text-2xl font-bold">{PAGE_TITLE}</h2>
            <p className="mt-2 text-sm text-zinc-300">{PAGE_DESCRIPTION}</p>

            <div className="my-6">
              <PeriodicReviewList result={result} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
