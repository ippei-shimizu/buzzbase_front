import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打率とは？計算方法（出し方）と3割の価値・目安をわかりやすく解説",
  description:
    "打率は安打数÷打数で求める最も基本的な打撃指標。四球が含まれない理由、打数と打席数の違い、.250で平均・.300で好打者などNPB・高校野球・中学野球の目安を解説。無料の打率計算ツール付き。",
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average",
  },
};

export default function BattingAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
