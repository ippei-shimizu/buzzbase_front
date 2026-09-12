import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "長打率 .450 とは？好打者ラインの意味と達成条件を解説",
  description:
    "長打率 .450 は NPB の好打者ライン。上位レギュラー水準で、アベレージと長打のバランスが取れた打者の標準値。達成条件を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/slg-450",
  },
};

export default function Slg450Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
