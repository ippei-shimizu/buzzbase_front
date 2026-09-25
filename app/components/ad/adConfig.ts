export const ADSENSE_CLIENT_ID = "ca-pub-2173577862865148";

export const isAdsenseEnabled =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

/**
 * AdSense 本体スクリプトを読み込んでよい環境か。
 *
 * 広告枠と同じ条件に加えて本番のみに絞る。枠が 1 つも出ない環境
 * （NEXT_PUBLIC_ADSENSE_ENABLED 未設定の preview / stg）でスクリプトだけ読み込まれるのを防ぐ。
 */
export const isAdsenseScriptEnabled =
  isAdsenseEnabled && process.env.NODE_ENV === "production";

// ディスプレイ広告はすべて AdBanner のデフォルト（format="auto"）で描画される。
// 枠ごとの違いは配置だけなので、JSDoc には配置と種別（ディスプレイ / インフィード）だけを書く
export const adSlots = {
  /** 計算ツールページ CTAバナー下 ディスプレイ広告 */
  toolsDisplay: "6569468966",
  /** ダッシュボード インフィード広告 */
  dashboardInFeed: "8812488929",
  /** 成績一覧 インフィード広告 */
  gameResultListInFeed: "6315018792",
  /** ツール詳細ページ 解説/目安の下 ディスプレイ広告 */
  toolsDetailMiddle: "5252651311",
  /** ツール一覧ページ 打撃指標セクション下 ディスプレイ広告 */
  toolsListBattingBottom: "3425965724",
  /** ツール一覧ページ チーム指標セクション下（最下部） ディスプレイ広告 */
  toolsListTeamBottom: "2112884050",
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
  /** ツール詳細ページ 関連ツール下 ディスプレイ広告 */
  toolsDetailFooter: "7612055498",
  /** ツール一覧ページ 投手指標セクション下 ディスプレイ広告 */
  toolsListPitchingBottom: "3672810486",
  /** 成績算出ページ 目次下 ディスプレイ広告 */
  calcGradesTop: "7196288375",
  /** コラムページ 中間 ディスプレイ広告 */
  columnMiddle: "1821345216",
  /** コラムページ 下部 ディスプレイ広告 */
  columnBottom: "6882100207",
  /** コラムページ 最下部 ディスプレイ広告 */
  columnFooter: "4770675289",
  /**
   * ツール詳細ページ 計算結果直下 レクタングル広告
   * TODO: AdSense 管理画面でディスプレイ広告ユニット「BUZZ BASE toolsResultRectangle」を作成し、そのスロット ID を設定する
   */
  toolsResultRectangle: "",
} as const;
