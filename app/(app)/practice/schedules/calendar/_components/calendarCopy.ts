import { FREE_CALENDAR_WINDOW_MONTHS } from "@app/constants/schedule";

/** 予定カレンダー画面の文言。表示のゆれを避けるため 1 箇所に集約する。 */

export const PAGE_TITLE = "予定カレンダー";
export const PAGE_DESCRIPTION =
  "登録した予定を月・週・日の3つの見え方で確認できます。毎週くり返す予定も、その週の日付に展開して表示します。";

export const MODE_MONTH_LABEL = "月";
export const MODE_WEEK_LABEL = "週";
export const MODE_DAY_LABEL = "日";
export const MODE_GROUP_LABEL = "表示の切り替え";

export const PREV_LABEL = "前へ";
export const NEXT_LABEL = "次へ";
export const TODAY_LABEL = "今日";

export const ADD_PLAN_LABEL = "この日の予定を追加";
export const EMPTY_MESSAGE = "予定はありません";
export const LOADING_MESSAGE = "予定を読み込み中";

/** 0 件と取得失敗を同じ見た目にすると「予定なし」と誤読させるため、文言を分ける。 */
export const LOAD_ERROR =
  "予定を取得できませんでした。時間を置いて再度お試しください。";

export const LOCKED_DAY_LABEL = "Pro限定";
export const PAYWALL_TITLE = "カレンダーを全期間で見る";
export const PAYWALL_DESCRIPTION = `無料プランで見られるのは今日の前後${FREE_CALENDAR_WINDOW_MONTHS}ヶ月までです。Pro プランなら先々の予定も過去の練習プランも、月を遡らず確認できます。`;
export const PAYWALL_RANGE_NOTICE = `無料プランでは今日の前後${FREE_CALENDAR_WINDOW_MONTHS}ヶ月を超える日の予定は表示されません。`;
