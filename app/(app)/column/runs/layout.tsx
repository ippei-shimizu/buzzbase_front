import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "野球の失点とは？自責点との違い・失点率の計算方法を解説",
  description:
    "野球の失点の意味・自責点との違い・失点率の計算方法を解説。防御率との関係やよくある質問もわかりやすく説明します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/runs",
  },
};

export default function RunsColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
