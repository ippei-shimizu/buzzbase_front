import { type Metadata } from "next";
import {
  BATTING_AVERAGE_COLUMN_DESCRIPTION,
  BATTING_AVERAGE_COLUMN_TITLE,
} from "./_constants/meta";

export const metadata: Metadata = {
  title: BATTING_AVERAGE_COLUMN_TITLE,
  description: BATTING_AVERAGE_COLUMN_DESCRIPTION,
  alternates: {
    canonical: "https://buzzbase.jp/column/batting-average",
  },
};

export default function BattingAverageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
