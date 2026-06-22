import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OPS .700 は平均？高校野球・プロ野球での位置づけを解説",
  description:
    "OPS .700 はNPB・MLBのリーグ平均ラインで、レギュラー定着の最低ラインの目安。プロ野球・高校野球・中学野球それぞれでの位置づけと、.700を超えるための課題を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-700",
  },
};

export default function Ops700ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
