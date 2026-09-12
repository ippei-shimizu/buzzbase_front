import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "防御率はいくつから良い？レベル別の目安・基準・先発/中継ぎ別を解説",
  description:
    "防御率（ERA）はいくつから良いのか、1.00 / 2.00 / 3.00 / 4.00 台の意味とカテゴリ別（中学・高校・大学・社会人・プロ）の目安、先発投手と中継ぎ投手で異なる基準を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-criteria",
  },
};

export default function EraCriteriaColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
