import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB OPSランキング｜歴代シーズン上位と現役主要選手の目安",
  description:
    "NPB（日本プロ野球）の歴代シーズンOPSランキングと、現役主力打者のOPS水準を整理。王貞治・落合博満・松井秀喜・バレンティンら歴代スラッガーの記録を一覧で掲載。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-ranking-npb",
  },
};

export default function OpsRankingNpbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
