"use client";

import dynamic from "next/dynamic";
import HeaderTop from "@app/components/header/HeaderTop";

// NOTE: Top コンポーネントは Mantine UI を使用しており、
// SSR 時の hydration エラーを回避するためクライアントサイドのみでレンダリングする
const Top = dynamic(() => import("@app/components/page/Top"), {
  ssr: false,
  loading: () => <div className="w-full min-h-screen animate-pulse" />,
});

export default function Home() {
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main pb-36">
        <HeaderTop />
        <Top />
      </div>
    </>
  );
}
