"use client";

import Script from "next/script";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { ADSENSE_CLIENT_ID, isAdsenseScriptEnabled } from "./adConfig";

/**
 * AdSense 本体スクリプトを読み込む。no_ads を持つ Pro 加入者には読み込ませない。
 *
 * ProStatusProvider 配下でのみ意味を持つため (app)/layout.tsx に置く。
 * strategy="afterInteractive" はもともとハイドレーション後に読み込むため、
 * ハイドレーション直後に確定する未認証ユーザーの読み込み開始は実質遅れない。
 *
 * 環境による出し分けもここで完結させる。呼び出し側に置くと、広告枠が 1 つも出ない環境
 * （NEXT_PUBLIC_ADSENSE_ENABLED 未設定）でスクリプトだけ読み込まれる状態を作りやすい。
 */
export default function AdsenseScript() {
  const { hasEntitlement, isLoading } = useEntitlement();

  if (!isAdsenseScriptEnabled) return null;
  if (isLoading || hasEntitlement("no_ads")) return null;

  return (
    <Script
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
