import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "長打率はいくつから良い？レベル別の目安・基準・ポジション別を解説",
  description:
    "長打率 .380 / .450 / .500 / .550 の意味と、中学・高校・大学・社会人・プロのカテゴリ別目安テーブル、ポジション別の基準まで整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg-criteria",
  },
};

export default function SlgCriteriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
