import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MLB 長打率ランキング｜歴代シーズン上位とキャリア通算 TOP",
  description:
    "MLB（メジャーリーグ）の歴代シーズン長打率と通算長打率の TOP 級を整理。バリー・ボンズ、ベーブ・ルース、テッド・ウィリアムズらが残した記録を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg-ranking-mlb",
  },
};

export default function SlgRankingMlbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
