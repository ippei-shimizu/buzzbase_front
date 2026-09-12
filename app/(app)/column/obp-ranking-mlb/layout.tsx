import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MLB 出塁率ランキング｜歴代シーズン上位とキャリア通算 TOP",
  description:
    "MLB（メジャーリーグ）の歴代シーズン出塁率と通算出塁率の TOP 級を整理。テッド・ウィリアムズ、ベーブ・ルース、バリー・ボンズらが残した記録を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp-ranking-mlb",
  },
};

export default function ObpRankingMlbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
