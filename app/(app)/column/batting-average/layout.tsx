import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率とは？計算方法・打率の出し方・目安値を解説【計算ツール付き】",
  description:
    "打率の意味・計算式・打率の出し方をわかりやすく解説。打数と打席数の違い、NPB・高校野球の目安値を一覧表で掲載。無料計算ツールで今すぐ打率を計算できます。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average",
  },
};

export default function BattingAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
