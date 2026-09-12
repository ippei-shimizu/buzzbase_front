import { type Metadata } from "next";

export const metadata: Metadata = {
  title:
    "OPS 1.000 を超える選手の特徴と「1超え」の意味｜NPB・MLB歴代スラッガー",
  description:
    "OPS 1.000 超え（「1超え」）の意味と難易度を解説。NPB・MLB歴代の1.000超え選手、達成に必要な出塁率／長打率の目安、シーズン通算で記録するための条件を整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-1000",
  },
};

export default function Ops1000ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
