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
  /** マイページ下部 インフィード広告 */
  mypageBottomInFeed: "2343416949",
  /** マイページ試合一覧 インフィード広告 */
  mypageMatchListInFeed: "8717253604",
  /** ダッシュボード中間 インフィード広告 */
  dashboardMiddleInFeed: "9547119544",
  /** 試合一覧中間 インフィード広告 */
  gameResultListMiddleInFeed: "7759395150",
  /** 試合サマリー インフィード広告 */
  gameResultSummaryInFeed: "6215780592",
  /** グループ詳細 インフィード広告 */
  groupDetailInFeed: "7771003447",
  /** グループ一覧 インフィード広告 */
  groupListInFeed: "9020372484",
  /** ノート一覧 インフィード広告 */
  noteListInFeed: "4687076509",
  /** フォロワー インフィード広告 */
  followersInFeed: "7707290815",
  /** フォロー中 インフィード広告 */
  followingInFeed: "6457921774",
  /** お知らせ一覧 インフィード広告 */
  noticeListInFeed: "5133231818",
  /** 試合詳細結果 インフィード広告 */
  gameResultDetailInFeed: "",
  /** ツール詳細ページ 最下部 横長ディスプレイ広告 */
  toolsDetailHorizontal: "7612055498",
  /** ツール一覧ページ 最下部 横長ディスプレイ広告 */
  toolsListHorizontal: "3672810486",
  /** 成績算出ページ 最下部 横長ディスプレイ広告 */
  calcGradesHorizontal: "7196288375",
  /** コラムページ 中間 ディスプレイ広告 */
  columnMiddle: "1821345216",
  /** コラムページ 下部 ディスプレイ広告 */
  columnBottom: "6882100207",
  /** コラムページ 最下部 横長ディスプレイ広告 */
  columnHorizontal: "4770675289",
} as const;
