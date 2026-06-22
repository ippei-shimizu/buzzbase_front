import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 長打率平均値の推移｜セ・パ両リーグ平均と歴代スラッガーの比較",
  description:
    "NPB（日本プロ野球）のリーグ平均長打率の推移と、歴代スラッガーシーズンとの比較を整理。投高打低トレンド下での目安の見方を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/npb-slg-average",
  },
};

export default function NpbSlgAverageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
