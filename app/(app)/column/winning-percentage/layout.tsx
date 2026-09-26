import type { Metadata } from "next";
import {
  WINNING_PERCENTAGE_COLUMN_DESCRIPTION,
  WINNING_PERCENTAGE_COLUMN_TITLE,
} from "./_constants/meta";

export const metadata: Metadata = {
  title: WINNING_PERCENTAGE_COLUMN_TITLE,
  description: WINNING_PERCENTAGE_COLUMN_DESCRIPTION,
  alternates: {
    canonical: "https://buzzbase.jp/column/winning-percentage",
  },
};

export default function WinningPercentageColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
