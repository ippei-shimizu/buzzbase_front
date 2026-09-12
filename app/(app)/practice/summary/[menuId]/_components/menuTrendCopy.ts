/**
 * メニュー推移ページの文言。
 * 推移詳細の 403 は「無料枠の超過」ではなく「Pro プラン限定機能」を意味するため、
 * 件数ではなくプランで開放される機能として伝える。
 */

export const TREND_PAGE_TITLE = "メニューの推移";

export const TREND_PAGE_DESCRIPTION =
  "年別・月別・日別で積み上げの推移を確認できます。";

/** 取得失敗。バケットが 0 件（まだ記録がない）と必ず区別して出す。 */
export const TREND_LOAD_ERROR =
  "推移を取得できませんでした。時間を置いて再度お試しください。";

/** 取得はできたが集計対象の記録が無い状態。 */
export const TREND_EMPTY = "まだ記録がありません";

export const TREND_EMPTY_HINT =
  "このメニューを記録すると、ここに推移が表示されます。";

/** Pro 限定機能であることの説明（無料枠を使い切ったという意味ではない）。 */
export const TREND_PRO_ONLY_NOTE =
  "メニューごとの推移の詳細表示は Pro プラン限定の機能です。下のグラフはサンプルです。";

/**
 * back（Practices::MenuTrend / ShadowSwingTrend）の DAY_LIMIT と一致させる。
 * 日別は記録のある日を新しい順に 60 件までしか返さない。
 */
export const TREND_DAY_LIMIT = 60;

/** 日別が上限に達したときの注記。全期間を選んでも 60 件で頭打ちになることを伝える。 */
export const TREND_DAY_LIMIT_NOTICE = `日別は記録のある直近${TREND_DAY_LIMIT}日分までの表示です`;
