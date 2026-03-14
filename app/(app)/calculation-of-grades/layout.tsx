import { Metadata } from "next";

export const metadata: Metadata = {
  title: "野球成績の計算方法＆指標一覧｜打率・防御率・OPSなど全29指標を解説",
  description:
    "打率・防御率・OPS・出塁率・WHIP・K/BBなど全29指標の計算式・意味・目安を一覧で解説。各指標の無料計算ツール付きで、登録不要・ブラウザだけで今すぐ計算できます。BUZZ BASEなら試合成績を入力するだけで全指標を自動算出。",
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
