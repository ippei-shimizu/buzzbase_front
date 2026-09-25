import { type Metadata } from "next";
import { RUNS_COLUMN_DESCRIPTION, RUNS_COLUMN_TITLE } from "./_constants/meta";

export const metadata: Metadata = {
  title: RUNS_COLUMN_TITLE,
  description: RUNS_COLUMN_DESCRIPTION,
  alternates: {
    canonical: "https://buzzbase.jp/column/runs",
  },
};

export default function RunsColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
