import {
  FREE_VIDEO_MAX_DURATION_SECONDS,
  FREE_VIDEO_MAX_HEIGHT,
  MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH,
  PRO_VIDEO_MAX_DURATION_SECONDS,
} from "@app/constants/mediaAttachment";

/**
 * メディア添付の文言。
 * back の 403 は「Pro 限定機能」ではなく「無料枠（月3件）の超過」を意味するため、
 * 上限まわりの表現は件数を明示した文言に統一して1箇所で持つ。
 */

/** 無料枠を使い切ったユーザーに出す見出し。 */
export const FREE_LIMIT_TITLE = `無料プランでアップロードできる画像・動画は月${MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH}件までです`;

/** 上限解放後に何ができるかの説明。 */
export const FREE_LIMIT_DESCRIPTION = `Pro プランなら${MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH + 1}件目以降も無制限にアップロードでき、動画も${PRO_VIDEO_MAX_DURATION_SECONDS}秒まで保存できます。`;

/** 上限に達したことをその場で伝える1行（403 を受けたとき）。 */
export const FREE_LIMIT_NOTICE = `${FREE_LIMIT_TITLE}。今月はこれ以上アップロードできません。`;

export const SECTION_HEADING = "画像・動画";

/**
 * 選択ボタンの下に出す注意書き。
 * 件数の判定は back の 403 に委ねるため、ここは表示の出し分けだけに使う
 * （グランドファザリングで無料ユーザーが entitlement を持つ場合もある）。
 */
export function pickerHint(hasUnlimitedUploads: boolean): string {
  return hasUnlimitedUploads
    ? `動画は${PRO_VIDEO_MAX_DURATION_SECONDS}秒以内。ブラウザでは動画のトリミングはできません。`
    : `無料プランは月${MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH}件まで。動画は${FREE_VIDEO_MAX_DURATION_SECONDS}秒・${FREE_VIDEO_MAX_HEIGHT}px 以内（Pro は${PRO_VIDEO_MAX_DURATION_SECONDS}秒）。`;
}

export const ADD_BUTTON_LABEL = "画像・動画を追加";

export const CANCEL_UPLOAD_LABEL = "アップロードを中断";

/** アップロード中に離脱しようとしたときの警告。実際の文言はブラウザ既定に置き換わる。 */
export const LEAVE_WARNING_MESSAGE =
  "アップロードが完了していません。このページを離れると中断されます。";

export const ROLLBACK_MESSAGE =
  "メディアの保存に失敗したため、ノートは保存されませんでした。もう一度お試しください。";

export const DELETE_CONFIRM_TITLE = "この添付を削除しますか？";

export const DELETE_CONFIRM_BODY =
  "削除すると元に戻せません。メモも一緒に削除されます。";

export const MEMO_PLACEHOLDER = "このメディアについてのメモ";

export const STAGED_HEADING = "保存後にアップロードします";
