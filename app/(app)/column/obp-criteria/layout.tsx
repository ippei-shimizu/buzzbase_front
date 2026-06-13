import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "出塁率はいくつから良い？レベル別の目安・基準・ポジション別を解説",
  description:
    "出塁率（OBP）はいくつから良いのか、.310 / .350 / .380 / .420 のそれぞれの意味とカテゴリ別 (中学・高校・大学・社会人・プロ) の目安、ポジション別の基準を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp-criteria",
  },
};

export default function ObpCriteriaColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
