import { MENU_SET_FREE_LIMIT } from "@app/constants/menuSet";

/**
 * メニューセット画面の文言。
 * 無料枠の上限は back の 403 と同じ意味（Pro 限定機能ではなく「件数の上限超過」）で伝えるため、
 * 上限にまつわる文言は件数を明示した表現に統一して1箇所で持つ。
 */

export const PAGE_TITLE = "メニューセット";
export const PAGE_DESCRIPTION =
  "よく組む練習をひとつのセットにまとめておくと、予定登録や週プランでそのまま呼び出せます。";

export const CREATE_LABEL = "セットを作る";

/** セットを1件も持たないユーザーに、何のための機能かを伝える案内。 */
export const EMPTY_MESSAGE =
  "よく組む練習をセットにしておくと、予定登録や週プランでそのまま使えます";

export const ITEMS_EMPTY = "メニュー未設定";
export const LOAD_ERROR =
  "メニューセットを取得できませんでした。時間を置いて再度お試しください。";

/** メニューが削除済みで serializer が name を返せなかったときの代替表記。 */
export const UNKNOWN_MENU_NAME = "メニュー";

/** 無料枠を使い切ったユーザーに出す見出し。 */
export const FREE_LIMIT_TITLE = `無料プランで作成できるメニューセットは${MENU_SET_FREE_LIMIT}件までです`;

/** 上限解放後に何ができるかの説明。 */
export const FREE_LIMIT_DESCRIPTION = `Pro プランなら${MENU_SET_FREE_LIMIT + 1}つ目以降のメニューセットも自由に作成・編集できます。`;

/**
 * 作成 API が 403 を返したときにフォーム上へ出すエラー。
 * クライアント側の件数判定をすり抜けた（別端末で作成した等）ケースで表示する。
 */
export const FREE_LIMIT_SERVER_ERROR = `${FREE_LIMIT_TITLE}。${FREE_LIMIT_DESCRIPTION}`;

export const NAME_LABEL = "セット名";
export const NAME_PLACEHOLDER = "例: オフ日ルーティン";
export const NOTE_LABEL = "メモ（任意）";
export const NOTE_PLACEHOLDER = "例: 試合前日の軽め調整";
export const MENU_LABEL = "メニュー（任意）";

/** 練習メニューが1件も無いと空のセットしか作れないため、先に作る導線を添えて伝える。 */
export const MENUS_EMPTY =
  "練習メニューがありません。先に練習メニューを登録すると、セットに入れられます。";
export const MENUS_EMPTY_LINK_LABEL = "練習メニューを登録する";

/** back の assign_items が既存項目を destroy_all してから作り直すことを、保存前に伝える。 */
export const ITEMS_REPLACED_NOTICE =
  "保存すると、このセットのメニューは選択した内容にまるごと置き換わります。";

export const SAVE_LABEL = "作成する";
export const UPDATE_LABEL = "更新する";
export const CANCEL_LABEL = "キャンセル";

export const CREATE_PAGE_TITLE = "セットを作る";
export const EDIT_PAGE_TITLE = "セットを編集";

export const EDIT_LABEL = "編集";
export const DELETE_LABEL = "削除";
export const DELETE_CONFIRM_TITLE = "メニューセットの削除";

/** back の has_many :schedules, dependent: :nullify により、紐付いた予定自体は残る。 */
export const DELETE_KEEPS_SCHEDULES_NOTICE =
  "このセットを使っている予定は削除されず、メニューの紐付けだけが外れます。";

export const DETAIL_MENU_SECTION_TITLE = "メニュー";
export const DETAIL_NOTE_SECTION_TITLE = "メモ";
