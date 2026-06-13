import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OPSの最大値（マックス）は？理論値と歴代最高記録を解説",
  description:
    "OPSの理論上の最大値と、NPB・MLB歴代の最高OPS記録を解説。シーズンで記録された最高値、ベーブ・ルース／バリー・ボンズ／王貞治の記録、計算上の上限値まで整理。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-max",
  },
};

export default function OpsMaxColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
