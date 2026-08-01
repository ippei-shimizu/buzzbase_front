import type { ProStatus } from "../../types/pro";
import { cookies } from "next/headers";
import { cache } from "react";
import { getProStatus } from "./actions";

/**
 * Pro 状態をリクエスト単位でメモ化して取得する。
 * 同一リクエストで複数の Server Component が呼んでも API アクセスは1回に収まる。
 * 未認証時は API を叩かずに null を返す（UI 側で無料状態にフォールバックする）。
 *
 * 静的生成を捨てられないルートからは呼ばないこと。cookies() を読んだ時点で
 * そのルートは dynamic 扱いになる。
 */
export const getCachedProStatus = cache(async (): Promise<ProStatus | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value;
  const client = cookieStore.get("client")?.value;
  const uid = cookieStore.get("uid")?.value;
  if (!accessToken || !client || !uid) return null;

  return getProStatus();
});
