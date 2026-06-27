import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "出塁率 .380 とは？好打者上位ラインの目安と達成選手",
  description:
    "出塁率 .380 は NPB の好打者上位ライン。.380 を超える年間規定打席到達者は各球団の中核打者で、リードオフ・3 番打者として信頼される実力者です。",
  alternates: {
    canonical: "https://buzzbase.jp/column/obp-380",
  },
};

export default function Obp380Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
