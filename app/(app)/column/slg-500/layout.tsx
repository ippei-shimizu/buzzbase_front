import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "長打率 .500 とは？中心打者ラインの意味と達成条件を解説",
  description:
    "長打率 .500 は NPB の中心打者ライン。クリーンアップを任される強打者の標準値で、年間 20 本塁打以上が見える長打力。達成に必要な指標バランスを解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg-500",
  },
};

export default function Slg500Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
