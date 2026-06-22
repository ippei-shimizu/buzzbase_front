import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OPS .800 はどのレベル？プロ・高校野球での意味と実例を解説",
  description:
    "OPS .800 はクリーンアップを任される好打者の目安。NPB・MLBのリーグ平均との比較、高校野球・中学野球での位置づけ、.800を超えるための打撃指標バランスを解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-800",
  },
};

export default function Ops800ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
