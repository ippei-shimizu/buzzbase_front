export const ADSENSE_CLIENT_ID = "ca-pub-2173577862865148";

export const isAdsenseEnabled =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

export const adSlots = {
  /** 計算ツールページ CTAバナー下 ディスプレイ広告 */
  toolsDisplay: "",
  /** ダッシュボード インフィード広告 */
  dashboardInFeed: "",
  /** 成績一覧 インフィード広告 */
  gameResultListInFeed: "",
} as const;
