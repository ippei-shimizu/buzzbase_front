import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率 .250 は平均？高校野球・プロ野球での位置づけを解説",
  description:
    "打率 .250 は NPB のリーグ平均ライン。プロ・高校野球での意味とレギュラー定着の最低ラインとしての位置づけ、.250 から .280 / .300 へ上げるための改善ポイントを解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-250",
  },
};

export default function BattingAverage250ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
