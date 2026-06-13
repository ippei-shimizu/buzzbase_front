import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 出塁率平均値の推移｜セ・パ両リーグ平均と最高出塁率の関係",
  description:
    "NPB（日本プロ野球）のリーグ平均出塁率の推移と、最高出塁率タイトル獲得ラインとの関係を整理。投高打低トレンド下での目安の見方を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/npb-obp-average",
  },
};

export default function NpbObpAverageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
