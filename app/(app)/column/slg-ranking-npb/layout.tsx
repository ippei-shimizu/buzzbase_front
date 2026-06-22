import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 長打率ランキング｜歴代シーズン上位と本塁打王・MVP 級スラッガー",
  description:
    "NPB（日本プロ野球）の歴代シーズン長打率上位ランキング。王貞治・落合博満・バース・松井秀喜ら歴代スラッガーと現役主力打者の水準を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg-ranking-npb",
  },
};

export default function SlgRankingNpbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
