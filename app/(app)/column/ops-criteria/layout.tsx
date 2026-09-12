import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OPSはいくつから良い？レベル別の目安・基準・現場感を野球指標で解説",
  description:
    "OPS（オーピーエス）はいくつから良いのか、.700／.800／.900／1.000 の意味とカテゴリ別（中学・高校・大学・社会人・プロ）の目安を解説。チームで4番を任されるOPSや強豪校レギュラーのOPSなど現場感を交えて紹介。",
  alternates: {
    canonical: "https://buzzbase.jp/column/ops-criteria",
  },
};

export default function OpsCriteriaColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
