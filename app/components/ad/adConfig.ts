export const ADSENSE_CLIENT_ID = "ca-pub-2173577862865148";

export const isAdsenseEnabled =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

export const adSlots = {
  /** 計算ツールページ CTAバナー下 ディスプレイ広告 */
  toolsDisplay: "6569468966",
  /** ダッシュボード インフィード広告 */
  dashboardInFeed: "8812488929",
  /** 成績一覧 インフィード広告 */
  gameResultListInFeed: "6315018792",
  /** ツール詳細ページ 解説/目安の下 ディスプレイ広告 */
  toolsDetailMiddle: "5252651311",
  /** ツール詳細ページ CTA②の下 ディスプレイ広告 */
  toolsDetailBottom: "4739047393",
  /** ツール一覧ページ 打撃指標セクション下 ディスプレイ広告 */
  toolsListMiddle: "3425965724",
  /** ツール一覧ページ 最下部 ディスプレイ広告 */
  toolsListBottom: "2112884050",
  /** 成績算出ページ 打撃成績下 ディスプレイ広告 */
  calcGradesMiddle: "9799802384",
  /** 成績算出ページ 投手成績下 ディスプレイ広告 */
  calcGradesBottom: "8486720710",
} as const;
