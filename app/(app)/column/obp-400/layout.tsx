import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "出塁率 .400 とは？最高出塁率タイトル争いラインを解説",
  description:
    "出塁率 .400 はNPB の最高出塁率タイトル争いの中心ライン。.400 を超える歴代名打者、達成に必要な打率・四球数の目安を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp-400",
  },
};

export default function Obp400ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
