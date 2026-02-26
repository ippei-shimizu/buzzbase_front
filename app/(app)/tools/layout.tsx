import type { Metadata } from "next";
import Header from "@app/components/header/Header";

export const metadata: Metadata = {
  title: {
    template: "%s - BUZZ BASE",
    default: "野球計算ツール - BUZZ BASE",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="buzz-dark bg-main flex flex-col w-full min-h-screen">
      <Header />
      <main className="h-full w-full max-w-180 mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-16 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
