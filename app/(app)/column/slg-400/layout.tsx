import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "長打率 .400 とは？リーグ平均を超えるラインの意味と達成条件",
  description:
    "長打率 .400 は NPB のリーグ平均を上回るライン。レギュラーの最低ラインで、長打面の貢献が見える打者の標準値。達成条件と意味を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg-400",
  },
};

export default function Slg400Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
