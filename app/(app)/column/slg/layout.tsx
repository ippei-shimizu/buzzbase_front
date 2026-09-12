import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "長打率（SLG・ちょうだりつ）とは？意味・計算方法・目安をわかりやすく解説",
  description:
    "長打率（SLG）の読み方・意味・計算式・評価基準を解説。NPB・MLB・高校野球・中学野球の目安値、打率・OPS との違い、ポジション別の基準まで整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg",
  },
};

export default function SlgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
