"use client";

import Link from "next/link";
import { buildAppStoreUrl } from "@app/constants/app";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  /** ツール slug。GA4 `source_tool` として送信し、どのツールからの送客かを識別する */
  sourceTool?: string;
  /** GA4 `cta_location` および App Store `ct=` キャンペーン名。CTA 配置箇所を識別する */
  ctaLocation: string;
};

/**
 * 計算結果直下に置くアプリ訴求 CTA。
 * App Store バッジはデスクトップでは行き止まりになるため、画面幅で導線を出し分ける:
 * 狭幅はアプリ(App Store)導線、広幅は Web 登録(/signup)導線。
 * クリックは source_tool / cta_location 付きで計測し、ツール別の送客を可視化する。
 */
export default function ToolAppCta({ sourceTool, ctaLocation }: Props) {
  const eventParams = {
    cta_location: ctaLocation,
    ...(sourceTool ? { source_tool: sourceTool } : {}),
  };

  return (
    <div className="text-center">
      <a
        href={buildAppStoreUrl(ctaLocation)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("app_store_click", eventParams)}
        className="inline-block w-full rounded-lg bg-yellow-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-yellow-500 sm:hidden"
      >
        アプリで成績を記録する（無料）
      </a>
      <Link
        href="/signup"
        onClick={() => trackEvent("generate_lead", eventParams)}
        className="hidden w-full rounded-lg bg-yellow-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-yellow-500 sm:inline-block"
      >
        無料登録して成績を記録する
      </Link>
      <p className="mt-2 text-xs text-zinc-400">
        アプリなら成績推移グラフやランキングも見られます
      </p>
    </div>
  );
}
