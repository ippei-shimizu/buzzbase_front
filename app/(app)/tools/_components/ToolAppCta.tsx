"use client";

import Link from "next/link";
import AppStoreLink from "@app/components/cta/AppStoreLink";
import AppStoreQr from "@app/components/cta/AppStoreQr";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  /** ツール slug。GA4 `source_tool` として送信し、どのツールからの送客かを識別する */
  sourceTool?: string;
  /** GA4 `cta_location` および App Store `ct=` キャンペーン名。CTA 配置箇所を識別する */
  ctaLocation: string;
};

/**
 * 計算結果直下に置くアプリ訴求 CTA。
 * 「手計算はもう不要＝アプリが毎試合自動算出」という検索意図に接続した訴求にする。
 * App Store バッジはデスクトップでは行き止まりになるため、画面幅で導線を出し分ける:
 * 狭幅は公式 App Store バッジ、広幅は Web 登録(/signup)＋QR(スマホへ橋渡し)。
 * QR は App Store URL(?ct=tool_qr) を指す静的 SVG（ランタイム依存なし）。
 * クリックは source_tool / cta_location 付きで計測し、ツール別の送客を可視化する。
 */
export default function ToolAppCta({ sourceTool, ctaLocation }: Props) {
  return (
    <div className="rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-4 py-4 text-center">
      <p className="mb-3 text-sm text-zinc-200 leading-6">
        毎回この計算、手でやってる？
        アプリなら試合の数字を入れるだけで防御率もOPSも自動算出。記録がグラフで残り、チーム内ランキングでも比較できる。完全無料。
      </p>

      <div className="flex justify-center sm:hidden">
        <AppStoreLink
          ctaLocation={ctaLocation}
          extraEventParams={
            sourceTool ? { source_tool: sourceTool } : undefined
          }
        />
      </div>

      <div className="hidden sm:block">
        <Link
          href="/signup"
          onClick={() =>
            trackEvent("generate_lead", {
              cta_location: ctaLocation,
              ...(sourceTool ? { source_tool: sourceTool } : {}),
            })
          }
          className="inline-flex w-full items-center justify-center rounded-lg bg-yellow-500 px-6 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-yellow-400"
        >
          無料登録して成績を記録する
        </Link>

        <AppStoreQr className="mt-3 justify-center" />
      </div>
    </div>
  );
}
