/**
 * 「練習・活動」面の文言。
 * mobile のホーム（活動面）と表記を揃えるため1箇所にまとめる。
 * 空状態（0件）と取得失敗は必ず別文言にする。同じ文言にすると
 * 通信エラーを「まだ記録がない」と誤って伝えてしまう。
 */

export const HOME_PAGE_TITLE = "ホーム";

export const RECORD_PRACTICE_LABEL = "練習を記録";

export const RECORD_NOTE_LABEL = "野球ノートを記録";

export const RECORD_LIST_LABEL = "練習記録・野球ノートの一覧";

export const THEMES_SECTION_TITLE = "取り組んでいる課題";

export const THEMES_EMPTY =
  "いま取り組む課題を決めると、練習やノートがその課題に束ねられます。";

export const THEMES_LOAD_ERROR = "課題を取得できませんでした。";

export const THEMES_ADD_LABEL = "課題を設定する";

export const THEMES_MANAGE_LABEL = "課題を追加・管理";

export const GOALS_SECTION_TITLE = "目標管理";

export const GOALS_EMPTY = "目標を設定すると、達成度がここに表示されます。";

export const GOALS_LOAD_ERROR = "目標を取得できませんでした。";

export const GOALS_MANAGE_LABEL = "目標を管理";

export const TOOLS_SECTION_TITLE = "上達サイクルをまわす";

export const MONTHLY_SUMMARY_TITLE = "今月の積み上げ";

export const MONTHLY_SUMMARY_LOAD_ERROR =
  "今月の積み上げを取得できませんでした。";

export const MONTHLY_SUMMARY_MORE_LABEL = "メニュー別の積み上げを見る";

export const RECENT_PRACTICE_TITLE = "最近の練習";

export const RECENT_PRACTICE_EMPTY = "記録した練習がここに新しい順で並びます。";

export const RECENT_PRACTICE_LOAD_ERROR = "最近の練習を取得できませんでした。";

export const RECENT_PRACTICE_MORE_LABEL = "すべての記録を見る";

export const RECENT_PRACTICE_NO_MENU = "メニューの記録なし";

/** 1日分の行を開くリンクのラベル。日付表記をそのまま読み上げに使う。 */
export const recentPracticeDetailLabel = (dateText: string): string =>
  `${dateText}の練習の詳細を開く`;
