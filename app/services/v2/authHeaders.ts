import { cookies } from "next/headers";

// v2 API 呼び出しで共通利用する認証ヘッダー取得（DeviseTokenAuth の3トークン）。
// stats/actions.ts と同じ実装を v2 サービス層で共通化する。
// next/headers の cookies() を使うためサーバー実行専用。
export async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value;
  const client = cookieStore.get("client")?.value;
  const uid = cookieStore.get("uid")?.value;
  if (!accessToken || !client || !uid) return null;
  return {
    "Content-Type": "application/json",
    "access-token": accessToken,
    client,
    uid,
  };
}

// ミューテーション系 Server Action の戻り値。UI 側でバリデーションエラー
// （back の 422 `{ errors: [...] }`）を扱えるよう成否を明示する。
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

// 認証欠落時の共通エラー。
export const UNAUTHENTICATED_RESULT: { ok: false; errors: string[] } = {
  ok: false,
  errors: ["ログインが必要です"],
};
