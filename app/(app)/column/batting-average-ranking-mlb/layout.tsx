import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "MLB 打率歴代 TOP｜テッド・ウィリアムズ・イチローら歴代名打者",
  description:
    "MLB（メジャーリーグ）歴代シーズン打率上位ランキング。テッド・ウィリアムズの最後の 4 割打者 .406、イチローの .372、ホーンスビーら歴代名打者の記録を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-ranking-mlb",
  },
};

export default function BattingAverageRankingMlbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
