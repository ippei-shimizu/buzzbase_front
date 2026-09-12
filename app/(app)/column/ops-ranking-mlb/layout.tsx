import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "MLB OPS歴代TOP｜バリー・ボンズから現役まで歴代シーズン最高OPS",
  description:
    "MLB（メジャーリーグ）歴代シーズンOPSランキング。バリー・ボンズ、ベーブ・ルース、テッド・ウィリアムズら超一流打者の記録、近年のフアン・ソトらの水準を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-ranking-mlb",
  },
};

export default function OpsRankingMlbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
