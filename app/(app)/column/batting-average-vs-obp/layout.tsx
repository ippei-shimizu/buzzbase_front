import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率と出塁率の違いをわかりやすく解説｜AVG と OBP の使い分け",
  description:
    "打率（AVG）と出塁率（OBP）の違いと使い分け方を、四球・死球・犠飛の扱いから具体例で解説。打率は高いのに出塁率が低い／逆のケースも紹介します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-vs-obp",
  },
};

export default function BattingAverageVsObpColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
