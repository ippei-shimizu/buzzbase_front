"use client";

import dynamic from "next/dynamic";

const Top = dynamic(() => import("@app/components/page/Top"), {
  ssr: false,
  loading: () => <div className="w-full min-h-screen animate-pulse" />,
});

export default function TopLoader() {
  return <Top />;
}
