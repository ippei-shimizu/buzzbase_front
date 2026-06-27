import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB OPS平均値の推移｜セ・パ両リーグの平均と歴代スラッガーの比較",
  description:
    "NPB（日本プロ野球）のリーグ平均OPSの推移を整理。セ・リーグ／パ・リーグの違い、近年のリーグ平均、歴代の強打者シーズンとの比較を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/npb-ops-average",
  },
};

export default function NpbOpsAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
