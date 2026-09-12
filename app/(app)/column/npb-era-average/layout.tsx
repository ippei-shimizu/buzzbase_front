import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "NPB 防御率平均値の推移｜セ・パ両リーグの平均と歴代エースの比較",
  description:
    "NPB（日本プロ野球）のリーグ平均防御率の推移を整理。セ・リーグ／パ・リーグの違い、近年のリーグ平均、歴代エースシーズンとの比較を解説します。",
  alternates: {
    canonical: "https://buzzbase.jp/column/npb-era-average",
  },
};

export default function NpbEraAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
