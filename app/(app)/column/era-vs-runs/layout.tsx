import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "防御率と失点率の違いをわかりやすく解説｜自責点・失点の使い分け",
  description:
    "防御率（ERA）と失点率（RA）の違いと使い分け方を、自責点と失点の定義から具体例で解説。投手評価で両者をどう見るべきかを整理します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-vs-runs",
  },
};

export default function EraVsRunsColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
