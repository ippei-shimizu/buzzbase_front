import { type Metadata } from "next";
import { OPS_COLUMN_DESCRIPTION, OPS_COLUMN_TITLE } from "./_constants/meta";

export const metadata: Metadata = {
  title: OPS_COLUMN_TITLE,
  description: OPS_COLUMN_DESCRIPTION,
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
