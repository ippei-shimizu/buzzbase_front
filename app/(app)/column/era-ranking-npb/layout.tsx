import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 防御率ランキング｜歴代シーズン上位の名投手",
  description:
    "NPB（日本プロ野球）の歴代シーズン防御率上位ランキング。村田兆治・江夏豊・伊藤智仁・斉藤雅樹ら名投手の記録を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-ranking-npb",
  },
};

export default function EraRankingNpbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
