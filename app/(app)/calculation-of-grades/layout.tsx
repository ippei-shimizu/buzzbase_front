import { type Metadata } from "next";

export const metadata: Metadata = {
  title:
    "野球の成績指標29種の計算方法まとめ｜打率・OPS・防御率を図解で解説【計算ツール付き】",
  description:
    "打率・出塁率・長打率・OPS・防御率・K/BBなど野球の全29指標の計算方法を一覧で解説。各指標の無料計算ツールへのリンク付き。中学・高校野球選手向けにわかりやすく解説。",
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
