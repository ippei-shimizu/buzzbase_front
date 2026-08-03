import { FREE_GRASS_WINDOW_DAYS } from "@app/constants/activity";

/** 草グラフ（継続）セクションの文言。表示のゆれを避けるため 1 箇所に集約する。 */

export const SECTION_TITLE = "継続";
export const HEATMAP_LABEL = "活動の記録マップ";

export const CAPTION_PLACEHOLDER =
  "マスを選ぶと、その日の日付と内容が表示されます";

export const EMPTY_MESSAGE =
  "まだ記録がありません。練習や試合を記録すると、この記録マップが緑に染まります。";

/** 0 件と取得失敗を同じ見た目にすると「記録していない」と誤読させるため、文言を分ける。 */
export const LOAD_ERROR =
  "活動の記録を取得できませんでした。時間を置いて再度お試しください。";

export const LEGEND_LABEL = "活動量の凡例";

export const PAYWALL_TITLE = "記録マップを全期間で見る";
export const PAYWALL_DESCRIPTION = `無料プランで見られるのは直近${FREE_GRASS_WINDOW_DAYS}日ぶんです。Pro プランなら1年ぶんの記録マップで、続けてきた積み重ねをまとめて振り返れます。`;
export const PAYWALL_RANGE_NOTICE = `直近${FREE_GRASS_WINDOW_DAYS}日より前の記録は表示していません（記録が無いわけではありません）。`;
