/** 「今日のやること」セクションの文言。表示のゆれを避けるため 1 箇所に集約する。 */

export const SECTION_TITLE = "今日のやること";

/** 0 件と取得失敗を同じ見た目にすると「予定なし」と誤読され、重複登録を招く。 */
export const EMPTY_MESSAGE = "今日の予定はありません";
export const LOAD_ERROR =
  "今日の予定を取得できませんでした。時間を置いて再度お試しください。";

export const ADD_PLAN_LABEL = "今日やることを登録";
export const RECORD_PRACTICE_LABEL = "今日の練習を記録する";
export const RECORD_GAME_LABEL = "試合結果を記録する";
export const CALENDAR_LABEL = "カレンダー";
export const MANAGE_PLAN_LABEL = "プランを管理";

/** 引き継がれるのが「済」にしたメニューだけであることを明示する。 */
export const RECORD_PRACTICE_HELPER =
  "「済」にしたメニューを選択済みの状態で練習記録画面を開きます。";

export const TOGGLE_DONE_ERROR = "「済」にできませんでした";
export const TOGGLE_UNDONE_ERROR = "「済」を解除できませんでした";

/** メニューセット由来の予定であることを示す補足。 */
export const menuSetHint = (title: string): string => `「${title}」より`;
