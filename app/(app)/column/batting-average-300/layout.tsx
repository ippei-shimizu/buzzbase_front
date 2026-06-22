import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率 3 割の意味｜「3割打者」がすごい理由とプロ・高校での難易度",
  description:
    "打率 .300（3 割打者）が好打者の代名詞とされる理由、NPB・MLB の歴代 3 割打者、達成に必要な打席ごとの安打ペースを解説。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average-300",
  },
};

export default function BattingAverage300ColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
