import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 出塁率ランキング｜歴代シーズン上位と最高出塁率タイトル獲得者",
  description:
    "NPB（日本プロ野球）の歴代シーズン出塁率上位ランキング。最高出塁率タイトル獲得者と現役主力打者の水準を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp-ranking-npb",
  },
};

export default function ObpRankingNpbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
