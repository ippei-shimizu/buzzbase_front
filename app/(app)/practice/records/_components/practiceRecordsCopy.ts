/**
 * 練習記録の一覧・詳細画面の文言。
 * mobile の記録タブ / 練習記録詳細と表記を揃えるため1箇所にまとめる。
 */

export const PAGE_TITLE = "記録";

export const PRACTICE_TAB_LABEL = "練習記録";

export const NOTE_TAB_LABEL = "野球ノート";

export const MANAGE_MENUS_LABEL = "練習メニューを管理";

export const RECORD_PRACTICE_LABEL = "練習を記録";

export const MENU_SUMMARY_LABEL = "メニュー別の積み上げを見る";

export const SEARCH_LABEL = "練習記録を検索";

export const SEARCH_PLACEHOLDER = "メニュー名・メモ・気分などで検索";

export const SESSIONS_EMPTY_MESSAGE = "まだ練習記録がありません。";

export const SESSIONS_NO_MATCH_MESSAGE = "条件に一致する練習記録がありません。";

/** 取得失敗を0件と誤表示しないための文言。 */
export const SESSIONS_LOAD_ERROR =
  "練習記録を読み込めませんでした。時間を置いて再度お試しください。";

export const SESSIONS_FORBIDDEN = "練習記録を表示する権限がありません。";

export const MENUS_EMPTY_LOG_MESSAGE = "メニューの記録なし";

export const NOTE_BADGE_LABEL = "ノート";

export const DETAIL_MENU_SECTION_TITLE = "やった練習";

export const DETAIL_MEMO_SECTION_TITLE = "この日のメモ";

export const DETAIL_NOTES_SECTION_TITLE = "紐づく野球ノート";

export const DETAIL_NOTES_EMPTY_MESSAGE =
  "この練習記録に紐づく野球ノートはありません。";

/** ノート一覧の取得失敗は「ノート0件」と区別する。 */
export const DETAIL_NOTES_LOAD_ERROR =
  "紐づく野球ノートを読み込めませんでした。";

export const DETAIL_NOT_FOUND = "練習記録が見つかりません。";

export const DETAIL_LOAD_ERROR =
  "練習記録を読み込めませんでした。時間を置いて再度お試しください。";

export const DETAIL_FORBIDDEN = "この練習記録を表示する権限がありません。";

export const BACK_TO_LIST_LABEL = "練習記録の一覧へ戻る";

export const EDIT_LABEL = "編集する";

export const DELETE_LABEL = "削除する";

export const DELETE_MODAL_TITLE = "練習記録の削除";

export const DELETE_CANCEL_LABEL = "キャンセル";

export const DELETE_CONFIRM_LABEL = "削除";

export const DELETE_SUCCESS_MESSAGE = "練習記録を削除しました";

/**
 * 削除確認の説明。back は practice_logs を dependent: :destroy、
 * baseball_notes を dependent: :nullify で扱い、condition_logs は別テーブルで消えない。
 */
export const DELETE_CONFIRM_DESCRIPTION =
  "この日に記録した練習メニューのログもすべて削除されます。紐づく野球ノートとコンディションの記録は削除されず、練習記録との紐付けだけが外れます。";

export const deleteConfirmQuestion = (date: string): string =>
  `${date}の練習記録を削除しますか？`;
