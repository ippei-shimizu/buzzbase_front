"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID, isAdsenseEnabled } from "./adConfig";

type Props = {
  slot: string;
  layoutKey?: string;
  className?: string;
};

export default function AdInFeed({ slot, layoutKey, className = "" }: Props) {
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!isAdsenseEnabled || !slot || isAdLoaded.current) return;

    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||
        []).push({});
      isAdLoaded.current = true;
    } catch {
      // AdSense script not loaded
    }
  }, [slot]);

  if (!isAdsenseEnabled || !slot) return null;

  return (
    <div className={`ad-container my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
}
