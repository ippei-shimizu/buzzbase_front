"use client";

import Image from "next/image";
import { buildAppStoreUrl } from "@app/constants/app";
import { trackEvent } from "@app/lib/analytics";

type Props = {
  /** App Store URL の `?ct=` キャンペーンパラメータと GA4 イベントの cta_location 値を兼ねる */
  ctaLocation: string;
  /** GA4 `app_store_click` に追加で送るパラメータ（tool 等） */
  extraEventParams?: Record<string, unknown>;
  className?: string;
  width?: number;
  height?: number;
  imageClassName?: string;
};

/**
 * App Store バッジリンクの共通 Client コンポーネント。
 * `?ct=<ctaLocation>` を URL に付与し、クリック時に GA4 `app_store_click` を送信する。
 * trackEvent は no-throw 設計なので外部リンク遷移は常に実行される。
 */
export default function AppStoreLink({
  ctaLocation,
  extraEventParams,
  className,
  width = 150,
  height = 50,
  imageClassName = "h-[44px] w-auto",
}: Props) {
  const handleClick = () => {
    trackEvent("app_store_click", {
      cta_location: ctaLocation,
      ...extraEventParams,
    });
  };

  return (
    <a
      href={buildAppStoreUrl(ctaLocation)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      <Image
        src="/images/download_app_store_badge_jp.svg"
        alt="App Storeからダウンロード"
        width={width}
        height={height}
        className={imageClassName}
      />
    </a>
  );
}
