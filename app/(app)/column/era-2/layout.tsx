import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "防御率 2 点台はどのレベル？プロ・高校野球での意味とエース基準",
  description:
    "防御率 2.00 〜 2.99 はリーグを代表するエース級。NPB タイトル争い、MLB Cy Young 級、高校野球の主戦投手レベルでの意味を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-2",
  },
};

export default function Era2ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
