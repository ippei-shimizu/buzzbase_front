"use client";

import Script from "next/script";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { ADSENSE_CLIENT_ID } from "./adConfig";

/**
 * AdSense 本体スクリプトを読み込む。no_ads を持つ Pro 加入者には読み込ませない。
 *
 * ProStatusProvider 配下でのみ意味を持つため (app)/layout.tsx に置く。
 * strategy="afterInteractive" はもともとハイドレーション後に読み込むため、
 * ハイドレーション直後に確定する未認証ユーザーの読み込み開始は実質遅れない。
 */
export default function AdsenseScript() {
  const { hasEntitlement, isLoading } = useEntitlement();

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
