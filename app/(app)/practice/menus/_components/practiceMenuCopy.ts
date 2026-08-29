import { PRACTICE_MENU_FREE_LIMIT } from "@app/constants/practice";

/**
 * 練習メニュー画面の文言。
 * 無料枠の上限は back の 403 と同じ意味（Pro 限定機能ではなく「件数の上限超過」）で伝えるため、
 * 上限にまつわる文言は件数を明示した表現に統一して1箇所で持つ。
 */

/** 無料枠を使い切ったユーザーに出す見出し。 */
export const FREE_LIMIT_TITLE = `無料プランで登録できる練習メニューは${PRACTICE_MENU_FREE_LIMIT}件までです`;

/** 上限解放後に何ができるかの説明。 */
export const FREE_LIMIT_DESCRIPTION = `Pro プランなら${PRACTICE_MENU_FREE_LIMIT + 1}つ目以降の練習メニューも自由に登録・編集できます。`;

/**
 * 作成 API が 403 を返したときにフォーム上へ出すエラー。
 * クライアント側の件数判定をすり抜けた（別端末で作成した等）ケースで表示する。
 */
export const FREE_LIMIT_SERVER_ERROR = `${FREE_LIMIT_TITLE}。${FREE_LIMIT_DESCRIPTION}`;

export const EMPTY_MESSAGE = "まだ練習メニューがありません";

export const NAME_REQUIRED_ERROR = "メニュー名を入力してください";

/** 削除は archived による論理削除で、記録済みの練習ログは消えないことを伝える。 */
export const DELETE_KEEPS_LOGS_NOTICE =
  "これまでに記録した練習ログは削除されず、そのまま残ります。";
