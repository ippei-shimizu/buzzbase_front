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

export const CONDITION_SECTION_TITLE = "コンディション（任意）";

export const CONDITION_PRO_BADGE = "Pro限定";

export const CONDITION_FATIGUE_LABEL = "疲労度";

export const CONDITION_PHYSICAL_LABEL = "体調";

export const CONDITION_SLEEP_LABEL = "睡眠時間";

export const CONDITION_SLEEP_UNIT = "時間";

export const CONDITION_MOOD_LABEL = "気分";

export const CONDITION_MEMO_LABEL = "気分のメモ";

export const CONDITION_MEMO_PLACEHOLDER = "気分のメモ（任意）";

export const CONDITION_INJURY_LABEL = "怪我・痛み";

export const INJURY_ADD_LABEL = "部位を追加";

export const INJURY_MEMO_PLACEHOLDER = "軽い張り など（任意）";

/**
 * 4段階ボタンの読み上げ名。
 * 疲労度と体調で同じラベル（「ふつう」）が並ぶため、どちらの段階かを名前に含める。
 */
export const conditionLevelOptionLabel = (
  title: string,
  label: string,
): string => `${title}: ${label}`;

/** 怪我の入力欄は複数行に増えるため、読み上げ名に何件目かを含めて区別できるようにする。 */
export const injuryRowLabel = (index: number): string =>
  `${index + 1}件目の怪我・痛み`;

export const injuryPartLabel = (index: number, part: string): string =>
  `${injuryRowLabel(index)}の部位: ${part}`;

export const injuryMemoLabel = (index: number): string =>
  `${injuryRowLabel(index)}のメモ`;

export const injuryRemoveLabel = (index: number): string =>
  `${injuryRowLabel(index)}を削除`;

/** 無料プランで2件目の課題を選ぼうとしたときの案内（back の 403 と同じ意味）。 */
export const MULTI_THEME_LIMIT_MESSAGE =
  "無料プランでは1つの記録に課題を1件までしか紐付けられません。Pro プランなら複数の課題に紐付けられます。";
