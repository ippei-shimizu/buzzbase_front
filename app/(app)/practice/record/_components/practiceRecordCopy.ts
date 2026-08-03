/**
 * 練習記録（日次セッション）画面の文言。
 * mobile の練習記録画面と表記を揃えるため1箇所にまとめる。
 */

export const PAGE_TITLE = "練習を記録する";

export const PAGE_DESCRIPTION =
  "日付ごとにその日やった練習をまとめて記録します。同じ日を選び直すと、記録済みの内容を読み込んで上書きできます。";

export const DATE_LABEL = "日付";

export const MENU_SECTION_TITLE = "練習メニュー（複数選択可）";

export const ADD_MENU_LABEL = "新しいメニューを追加";

export const MENUS_EMPTY_TITLE = "まだ練習メニューがありません";

export const MENUS_EMPTY_DESCRIPTION =
  "よくやる練習を登録すると、ワンタップで選べます";

export const CREATE_FIRST_MENU_LABEL = "最初のメニューを作る";

export const THEME_SECTION_TITLE = "取り組む課題（任意）";

export const THEME_EMPTY_MESSAGE = "取組中の課題がありません";

export const SAVE_WITH_NOTE_LABEL = "野球ノートを書く";

export const SAVE_ONLY_LABEL = "練習記録のみ保存";

export const SAVE_UPDATE_LABEL = "練習記録の変更を保存";

export const SAVE_SUCCESS_MESSAGE = "練習記録を保存しました";

export const NO_ITEMS_ERROR =
  "記録する内容がありません。メニューを選んでください";

/** 取得に失敗した日を「記録なし」と誤表示しないため、空フォームではなくこの文言を出す。 */
export const SESSION_LOAD_ERROR =
  "この日の練習記録を読み込めませんでした。時間を置いて再度お試しください。";

export const SESSION_LOADING_MESSAGE = "この日の記録を読み込んでいます…";

/** 無料プランで2件目の課題を選ぼうとしたときの案内（back の 403 と同じ意味）。 */
export const MULTI_THEME_LIMIT_MESSAGE =
  "無料プランでは1つの記録に課題を1件までしか紐付けられません。Pro プランなら複数の課題に紐付けられます。";
