import type { Metadata } from "next";
import { KBB_COLUMN_DESCRIPTION, KBB_COLUMN_TITLE } from "./_constants/meta";

export const metadata: Metadata = {
  title: KBB_COLUMN_TITLE,
  description: KBB_COLUMN_DESCRIPTION,
  alternates: {
    canonical: "https://buzzbase.jp/column/k-bb",
  },
};

export default function KbbColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
