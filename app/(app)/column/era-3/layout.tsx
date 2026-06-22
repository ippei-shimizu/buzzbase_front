import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "防御率 3 点台はどのレベル？リーグ平均ラインの位置づけを解説",
  description:
    "防御率 3.00 〜 3.99 は NPB のリーグ平均ライン。先発ローテーション中堅・ローテーション維持の最低ラインとしての位置づけと、改善ポイントを解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era-3",
  },
};

export default function Era3ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
