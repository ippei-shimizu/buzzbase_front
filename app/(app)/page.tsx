import type { Metadata } from "next";
import HeaderTop from "@app/components/header/HeaderTop";
import TopLoader from "./_components/TopLoader";

export const metadata: Metadata = {
  title: "BUZZ BASE｜野球の個人成績を無料で記録・計算・共有できるアプリ",
  description:
    "野球の個人成績をチームで記録・管理できる無料Webアプリ。打率・防御率・OPSなどの指標を自動計算、ランキング形式で共有。草野球・少年野球にも対応。",
};

export default function Home() {
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main pb-36">
        <HeaderTop />
        <TopLoader />
      </div>
    </>
  );
}
