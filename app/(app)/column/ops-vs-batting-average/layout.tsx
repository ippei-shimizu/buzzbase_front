import { type Metadata } from "next";

export const metadata: Metadata = {
  title:
    "OPSと打率・出塁率・長打率の違いをわかりやすく解説｜セイバーメトリクスの基本",
  description:
    "OPS・打率（AVG）・出塁率（OBP）・長打率（SLG）の違いと、それぞれの使い分け方を解説。打率が高いのにOPSが低いケース、その逆のケースも具体例で紹介。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-vs-batting-average",
  },
};

export default function OpsVsBattingAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
