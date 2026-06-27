import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 打率平均値の推移｜セ・パ両リーグの平均と歴代名打者の比較",
  description:
    "NPB（日本プロ野球）のリーグ平均打率の推移を整理。セ・リーグ／パ・リーグの違い、近年の低下傾向、歴代名打者との比較を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/npb-batting-average-average",
  },
};

export default function NpbBattingAverageAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
