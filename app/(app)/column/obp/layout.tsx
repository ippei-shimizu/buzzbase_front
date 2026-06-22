import { type Metadata } from "next";

export const metadata: Metadata = {
  title:
    "出塁率（OBP・しゅつるいりつ）とは？計算方法・打率との違い・目安値を解説【計算ツール付き】",
  description:
    "出塁率（OBP）の読み方・意味・計算式・打率との違いをわかりやすく解説。NPB・MLB・高校野球・中学野球の目安値、ポジション別の基準も掲載。無料計算ツールで今すぐ出塁率を計算できます。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp",
  },
};

export default function ObpColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
