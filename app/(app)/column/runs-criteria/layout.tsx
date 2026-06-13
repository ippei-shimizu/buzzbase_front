import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "失点率（RA）はいくつから良い？目安・計算方法・防御率との違いを解説",
  description:
    "失点率（RA）の意味と計算方法、レベル別の目安、防御率（ERA）との使い分けを解説。チーム守備力を含めた投手評価指標としての失点率の見方を整理します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/runs-criteria",
  },
};

export default function RunsCriteriaColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
