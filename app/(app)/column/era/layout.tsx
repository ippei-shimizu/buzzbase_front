import { type Metadata } from "next";
import { ERA_COLUMN_DESCRIPTION, ERA_COLUMN_TITLE } from "./_constants/meta";

export const metadata: Metadata = {
  title: ERA_COLUMN_TITLE,
  description: ERA_COLUMN_DESCRIPTION,
  alternates: {
    canonical: "https://buzzbase.jp/column/era",
  },
};

export default function EraColumnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
