import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "MLB 防御率歴代 TOP｜ボブ・ギブソンから現役まで歴代シーズン最低 ERA",
  description:
    "MLB（メジャーリーグ）歴代シーズン防御率上位ランキング。ボブ・ギブソン 1968 年の伝説的 1.12、ペドロ・マルティネス、グレッグ・マダックスら名投手の記録を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-ranking-mlb",
  },
};

export default function EraRankingMlbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
