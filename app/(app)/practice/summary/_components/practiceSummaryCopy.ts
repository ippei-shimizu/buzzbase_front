/**
 * 積み上げサマリー / 推移グラフ画面の文言。
 * 「Pro 限定機能」と「無料枠の超過」は back の 403 でも意味が違うため、
 * 推移詳細まわりの文言は必ず Pro 限定（プランで開放される機能）の文脈で書く。
 */

export const SUMMARY_PAGE_TITLE = "積み上げサマリー";

export const SUMMARY_PAGE_DESCRIPTION =
  "メニューごとの累計と今月の積み上げをまとめて確認できます。カードを開くと推移グラフを見られます。";

/** 取得失敗。0 件（まだ記録がない）と取り違えないよう別文言にする。 */
export const SUMMARY_LOAD_ERROR =
  "積み上げサマリーを取得できませんでした。時間を置いて再度お試しください。";

export const SUMMARY_EMPTY = "まだ練習の記録がありません";

export const SUMMARY_EMPTY_HINT =
  "練習を記録すると、メニューごとの累計がここに積み上がります。";

/** 削除済みメニューの記録。推移は practice_menu の id 単位で集計するため開けない。 */
export const ARCHIVED_MENU_NOTE = "削除したメニューの記録";

export const NOT_RECORDED_LABEL = "まだ記録がありません";
