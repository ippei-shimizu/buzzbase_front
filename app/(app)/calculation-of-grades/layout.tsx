import { Metadata } from "next";

export const metadata: Metadata = {
  title: "野球成績の計算方法＆指標一覧｜打率・防御率・OPSなど全29指標を解説",
  description:
    "打率、防御率、OPS、出塁率、WHIP、K/BBなど29の野球指標の計算式と意味を解説。BUZZ BASEなら試合結果を入力するだけで全指標を自動算出できます。完全無料。",
  alternates: {
    canonical: "https://buzzbase.jp/calculation-of-grades",
  },
};

export default function CalculationOfGradesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="buzz-dark bg-main flex flex-col w-full min-h-screen">
        {children}
      </div>
    </>
  );
}
