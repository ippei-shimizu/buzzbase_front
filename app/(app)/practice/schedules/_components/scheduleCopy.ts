import { SCHEDULE_TITLE_MAX_LENGTH } from "@app/constants/schedule";

/** 練習スケジュール画面の文言。表示のゆれを避けるため 1 箇所に集約する。 */

export const LOAD_ERROR =
  "予定を取得できませんでした。時間を置いて再度お試しください。";

export const RECURRENCE_LABEL = "いつ";
export const RECURRENCE_SINGLE_LABEL = "この日だけ";
export const RECURRENCE_WEEKLY_LABEL = "毎週";
export const EVENT_TYPE_LABEL = "種別";
export const TITLE_LABEL = "タイトル";
export const TITLE_OPTIONAL_LABEL = "タイトル（任意）";
export const TITLE_HELPER = `${SCHEDULE_TITLE_MAX_LENGTH}文字以内。メニューセットを選んだ場合は省略するとセット名が使われます。`;
export const TIME_LABEL = "時刻";
export const DATE_LABEL = "日付";
export const MENU_LABEL = "メニュー（任意）";
export const MENU_SOURCE_INDIVIDUAL_LABEL = "個別に選ぶ";
export const MENU_SOURCE_SET_LABEL = "セットから";
export const MENU_SETS_EMPTY =
  "メニューセットがありません。先にメニューセットを作ると、まとめて紐付けられます。";
export const MENUS_EMPTY =
  "練習メニューがありません。先に練習メニューを登録すると、予定に紐付けられます。";

/** 記録済みメニューを触らせない理由を、操作できない事実とセットで伝える。 */
export const LOCKED_MENU_NOTICE =
  "練習記録が「済」になっているメニューは、記録との対応が崩れるため変更できません。";
export const LOCKED_MENU_BADGE = "変更不可";
export const LOCKED_MENU_SOURCE_NOTICE =
  "「済」のメニューがあるため、メニューセットへの切り替えはできません。";

export const MENU_SET_ITEMS_EMPTY = "メニュー未設定";
export const END_TIME_LABEL = "終了時刻";
export const NOTE_LABEL = "メモ";
export const NOTE_PLACEHOLDER = "集合場所や持ち物など";

export const SAVE_LABEL = "登録する";
export const UPDATE_LABEL = "更新する";
export const CANCEL_LABEL = "キャンセル";

export const DELETE_LABEL = "削除";
export const EDIT_LABEL = "編集";
export const DELETE_CONFIRM_TITLE = "予定の削除";

/** 削除してもログは残る（back が schedule_id を nullify する）ことを伝える。 */
export const DELETE_KEEPS_LOGS_NOTICE =
  "この予定でつけた練習記録は削除されず、そのまま残ります。";

export const DETAIL_NOT_FOUND = "予定が見つかりません";
export const DONE_SECTION_TITLE = "メニュー";
export const DONE_LOAD_ERROR =
  "この日の練習記録を取得できませんでした。「済」の状態は表示できません。";
export const RECORD_PRACTICE_LABEL = "練習記録をつける";
export const RECORD_GAME_LABEL = "試合記録をつける";

/** 済メニューの引き継ぎ先が「その日」であることを明示する。 */
export const RECORD_PRACTICE_HELPER =
  "「済」にしたメニューを選択済みの状態で練習記録画面を開きます。";
