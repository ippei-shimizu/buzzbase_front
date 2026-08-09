import { isAxiosError } from "axios";

/** back の GROUP_FREE_LIMIT（無料は所属1件まで）に合わせた上限到達時の文言。 */
export const GROUP_FREE_LIMIT_MESSAGE =
  "無料プランで参加できるグループは1つまでです。Pro プランなら無制限に作成・参加できます";

/**
 * グループの作成・参加が無料枠の上限で拒否されたか。
 * 対象の3エンドポイント（グループ作成 / 招待コード参加 / 招待承認）が返す 403 は
 * 上限超過のみで、未認証は 401、権限外は別経路になるため status だけで判別できる。
 */
export function isGroupLimitError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403;
}
