import { type Metadata } from "next";

export const metadata: Metadata = {
  title:
    "防御率（ERA・ぼうぎょりつ）とは？計算方法・目安値・良い数値の基準を解説【計算ツール付き】",
  description:
    "防御率（ERA）の読み方・意味・計算式・評価基準を解説。NPB・MLB・高校野球・中学野球の目安値、先発・中継ぎ別の基準も掲載。無料計算ツールで今すぐ防御率を計算できます。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era",
  },
};

export default function EraColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
