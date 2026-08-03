import { REFLECTION_TEMPLATE_FREE_LIMIT } from "@app/constants/reflectionTemplate";

/**
 * 振り返りテンプレ画面の文言。
 * 無料枠の上限は back の 403 と同じ意味（Pro 限定機能ではなく「自作の件数の上限超過」）で
 * 伝えるため、上限にまつわる文言は件数を明示した表現に統一して1箇所で持つ。
 */

/** 無料枠を使い切ったユーザーに出す見出し。 */
export const FREE_LIMIT_TITLE = `無料プランで作成できる振り返りテンプレは${REFLECTION_TEMPLATE_FREE_LIMIT}件までです`;

/** 上限解放後に何ができるかの説明。 */
export const FREE_LIMIT_DESCRIPTION = `Pro プランなら${REFLECTION_TEMPLATE_FREE_LIMIT + 1}つ目以降の振り返りテンプレも自由に作成・編集できます。`;

/**
 * 作成・プリセット編集が 403 を返したときにフォーム上へ出すエラー。
 * クライアント側の件数判定をすり抜けた（別端末で作成した等）ケースで表示する。
 */
export const FREE_LIMIT_SERVER_ERROR = `${FREE_LIMIT_TITLE}。${FREE_LIMIT_DESCRIPTION}`;

/** プリセットの編集は共有プリセットを書き換えず、自分専用のコピーになることを伝える。 */
export const PRESET_EDIT_NOTICE =
  "プリセットを編集すると、自分専用のテンプレとして保存されます（元のプリセットは変わりません）。";

export const CUSTOM_EMPTY_MESSAGE =
  "まだ自作の振り返りテンプレがありません。自分専用の問いかけを作れます。";

export const TITLE_REQUIRED_ERROR = "テンプレ名を入力してください";

export const QUESTION_REQUIRED_ERROR = "問いを1つ以上入力してください";

/** 削除は使用中のノートがあると back に拒否されることを事前に伝える。 */
export const DELETE_NOTICE =
  "このテンプレを使っている野球ノートがある場合は削除できません。";
