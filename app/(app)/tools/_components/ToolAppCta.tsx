"use client";

import Link from "next/link";
import AppStoreLink from "@app/components/cta/AppStoreLink";
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
 * 狭幅は公式 App Store バッジ(アプリ導線)、広幅は Web 登録(/signup)導線。
 * クリックは source_tool / cta_location 付きで計測し、ツール別の送客を可視化する。
 */
export default function ToolAppCta({ sourceTool, ctaLocation }: Props) {
  return (
    <div className="rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-4 py-4 text-center">
      <p className="mb-3 text-sm text-zinc-200 leading-6">
        この成績をアプリで記録して、推移グラフやチーム内ランキングでも比較しよう。完全無料。
      </p>

      <div className="flex justify-center sm:hidden">
        <AppStoreLink
          ctaLocation={ctaLocation}
          extraEventParams={
            sourceTool ? { source_tool: sourceTool } : undefined
          }
        />
      </div>

      <Link
        href="/signup"
        onClick={() =>
          trackEvent("generate_lead", {
            cta_location: ctaLocation,
            ...(sourceTool ? { source_tool: sourceTool } : {}),
          })
        }
        className="hidden w-full items-center justify-center rounded-lg bg-yellow-500 px-6 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-yellow-400 sm:inline-flex"
      >
        無料登録して成績を記録する
      </Link>
    </div>
  );
}
