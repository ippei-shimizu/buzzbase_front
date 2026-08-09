import { isAxiosError } from "axios";

/** back の GROUP_FREE_LIMIT（無料は所属1件まで）に合わせた上限到達時の文言。 */
export const GROUP_FREE_LIMIT_MESSAGE =
  "無料プランで参加できるグループは1つまでです。Pro プランなら無制限に作成・参加できます";

/**
 * グループの作成・参加が無料枠の上限で拒否されたか。
 * 403 の原因が将来増えても誤判定しないよう、back が返す安定コード
 * （`group_limit_exceeded`）まで見て判定する。
 */
export function isGroupLimitError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    error.response?.status === 403 &&
    (error.response.data as { error?: string } | undefined)?.error ===
      "group_limit_exceeded"
  );
}
