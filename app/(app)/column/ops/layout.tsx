import { type Metadata } from "next";

export const metadata: Metadata = {
  title:
    "OPSとは（オーピーエス）｜読み方・計算方法・高校野球/プロ野球の目安を解説【計算ツール付き】",
  description:
    "OPS（オーピーエス）の読み方・意味・計算式・評価基準を解説。NPB・MLB・高校野球・中学野球の目安値を一覧表で掲載。無料計算ツールで今すぐ自分のOPSを計算できます。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops",
  },
};

export default function OpsColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
