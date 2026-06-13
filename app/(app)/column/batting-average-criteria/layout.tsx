import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率はいくつから良い？レベル別の目安・基準を解説",
  description:
    "打率（AVG）はいくつから良いのか、.250 / .280 / .300 / .350 のそれぞれの意味とカテゴリ別 (中学・高校・大学・社会人・プロ) の目安、ポジション別の基準を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-criteria",
  },
};

export default function BattingAverageCriteriaColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
