import { Metadata } from "next";
import Header from "@app/components/header/Header";

export const metadata: Metadata = {
  title: {
    template: "%s - BUZZ BASE",
    default: "コラム - BUZZ BASE",
  },
  description:
    "OPS・出塁率・長打率など、野球の指標をわかりやすく解説するコラム一覧。計算方法や目安値も掲載。",
};

export default function ColumnLayout({
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
