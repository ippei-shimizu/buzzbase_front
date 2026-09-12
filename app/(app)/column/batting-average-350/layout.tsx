import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率 .350 はどのレベル？歴代首位打者と達成条件",
  description:
    "打率 .350 以上は NPB 首位打者の上位ライン。イチロー・落合博満・青木宣親ら歴代の .350 越え打者と、達成に必要な打撃指標を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-350",
  },
};

export default function BattingAverage350ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
