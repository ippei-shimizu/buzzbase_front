"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID, isAdsenseEnabled } from "./adConfig";

type Props = {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
};

export default function AdBanner({
  slot,
  format = "auto",
  className = "",
}: Props) {
  const adRef = useRef<HTMLModElement>(null);
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
    <div className={`ad-container my-6 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
