import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "防御率 1 点台はどのレベル？歴代エースと達成条件",
  description:
    "防御率 1.00 〜 1.99 はリーグ歴代でも数えるほどのレジェンド水準。NPB・MLB 歴代の 1 点台投手と、達成に必要な被打率・WHIP の目安を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-1",
  },
};

export default function Era1ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
