import type { ProStatus } from "../../types/pro";
import { cookies } from "next/headers";
import { cache } from "react";
import { getProStatus } from "./actions";

const ANONYMOUS_IDENTITY_KEY = "anonymous";

async function readAuthCookies() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get("access-token")?.value,
    client: cookieStore.get("client")?.value,
    uid: cookieStore.get("uid")?.value,
  };
}

/**
 * Pro 状態をリクエスト単位でメモ化して取得する。
 * layout と page が同一リクエストで呼んでも API アクセスは1回に収まる。
 * 未認証時は API を叩かずに null を返す（UI 側で無料状態にフォールバックする）。
 */
export const getCachedProStatus = cache(async (): Promise<ProStatus | null> => {
  const { accessToken, client, uid } = await readAuthCookies();
  if (!accessToken || !client || !uid) return null;

  return getProStatus();
});

/**
 * ログイン中ユーザーを識別する文字列。未認証なら固定値を返す。
 * ProStatusProvider の key に使い、ログイン/ログアウトで Provider を作り直して
 * 前のユーザーの Pro 状態が client state に残るのを防ぐ。
 */
export const getProIdentityKey = cache(async (): Promise<string> => {
  const { uid } = await readAuthCookies();

  return uid ?? ANONYMOUS_IDENTITY_KEY;
});
