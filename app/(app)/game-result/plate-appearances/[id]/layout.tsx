import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "打席詳細",
  description:
    "記録した打席のカウント・ランナー状況・打球・対戦投手などの詳細を表示します。",
  robots: { index: false },
};

export default function PlateAppearanceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="buzz-dark bg-main flex flex-col w-full min-h-screen">
      {children}
    </div>
  );
}
