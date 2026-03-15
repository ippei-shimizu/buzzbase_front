import Header from "@app/components/header/Header";
import CtaBanner from "../_components/CtaBanner";
import BattingStatsSection from "./_components/BattingStatsSection";
import PitchingStatsSection from "./_components/PitchingStatsSection";
import TableOfContents from "./_components/TableOfContents";

export default function CalculationOfGrades() {
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <Header />
        <main className="h-full w-full max-w-180 mx-auto lg:m-[0_auto_0_28%]">
          <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-16 lg:mb-14">
            <div className="pt-20 px-4 lg:px-6">
              <h1 className="text-2xl font-bold">
                野球成績の計算方法＆指標一覧
              </h1>
              <p className="text-sm text-zinc-400 mt-2 mb-6">
                打率・防御率・OPSなど、野球で使われる全29指標の計算式と意味を解説します。
              </p>
              <TableOfContents />
              <div className="mt-6">
                <BattingStatsSection />
                <CtaBanner
                  className="my-10"
                  heading="全指標を自動で計算するなら"
                  body="BUZZ BASEなら試合結果を入力するだけで、上記の全指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
                  buttonText="無料で始める（30秒で登録）"
                />
                <PitchingStatsSection />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
