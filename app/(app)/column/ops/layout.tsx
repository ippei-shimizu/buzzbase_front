import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OPSとは？意味・計算方法・いくつから良いかの目安を解説【野球】",
  description:
    "OPS（オーピーエス）は出塁率と長打率を足した打者の総合指標。計算式と、.700で平均・.800で好打者・.900で強打者・1.000超えで超一流という目安をNPB・MLB・高校野球・中学野球別に解説。無料の計算ツール付き。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops",
  },
};

export default function OpsColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
