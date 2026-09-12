import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "出塁率 .350 とは？中堅レギュラー上位ラインの意味と達成条件",
  description:
    "出塁率 .350 は NPB の中堅レギュラー上位ライン。リーグ平均を一段上回る数値で、安定してスタメンを任される打者の標準値。計算方法・達成条件を解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp-350",
  },
};

export default function Obp350Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
