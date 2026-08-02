"use client";

import { ADSENSE_CLIENT_ID } from "./adConfig";
import { useAdSlot } from "./useAdSlot";

type Props = {
  slot: string;
  layoutKey?: string;
  className?: string;
};

export default function AdInFeed({ slot, layoutKey, className = "" }: Props) {
  const canRenderAd = useAdSlot(slot);

  if (!canRenderAd) return null;

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
