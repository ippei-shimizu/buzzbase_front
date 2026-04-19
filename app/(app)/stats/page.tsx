import Header from "@app/components/header/Header";
import StatsContainer from "./_components/StatsContainer";

export const metadata = {
  title: "成績 | BUZZ BASE",
  description: "打撃成績・投手成績を年別・月別・日別で確認できます。",
};

export default function StatsPage() {
  return (
    <>
      <Header />
      <main className="min-h-full max-w-[720px] mx-auto w-full lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-12 px-4 lg:px-6 lg:pb-6">
            <StatsContainer />
          </div>
        </div>
      </main>
    </>
  );
}
