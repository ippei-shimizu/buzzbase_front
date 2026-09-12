"use client";

import { ADSENSE_CLIENT_ID } from "./adConfig";
import { useAdSlot } from "./useAdSlot";

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
  const canRenderAd = useAdSlot(slot);

  if (!canRenderAd) return null;

  return (
    <div className={`ad-container my-6 ${className}`}>
      <ins
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
