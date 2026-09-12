import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 打率ランキング｜歴代シーズン上位の名打者",
  description:
    "NPB（日本プロ野球）の歴代シーズン打率上位ランキング。バース・イチロー・落合博満・青木宣親ら歴代の名打者の記録を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-ranking-npb",
  },
};

export default function BattingAverageRankingNpbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
