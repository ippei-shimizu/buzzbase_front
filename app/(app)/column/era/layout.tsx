import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "防御率とは？計算方法と良い数値の目安を先発・中継ぎ別に解説【野球】",
  description:
    "防御率（ERA）は自責点×9÷投球回で求める投手の指標。2.00以下でエース級、3.00台でリーグ平均などNPB・MLB・高校野球・中学野球の目安と、先発・中継ぎ・抑え別の基準をわかりやすく解説。無料の計算ツール付き。",
  alternates: {
    canonical: "https://buzzbase.jp/column/era",
  },
};

export default function EraColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
