import type { ProStatus } from "../../types/pro";
import { cookies } from "next/headers";
import { cache } from "react";
import { getProStatusResult, type ProStatusResult } from "./actions";

/**
 * Pro 状態を失敗理由付きで、リクエスト単位にメモ化して取得する。
 * 同一リクエストで複数の Server Component が呼んでも API アクセスは1回に収まる。
 * cookie が揃っていなければ API を叩かずに unauthorized を返す。
 *
 * 静的生成を捨てられないルートからは呼ばないこと。cookies() を読んだ時点で
 * そのルートは dynamic 扱いになる。
 */
export const getCachedProStatusResult = cache(
  async (): Promise<ProStatusResult> => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    const client = cookieStore.get("client")?.value;
    const uid = cookieStore.get("uid")?.value;
    if (!accessToken || !client || !uid) return { status: "unauthorized" };

    return getProStatusResult();
  },
);

/**
 * Pro 状態をリクエスト単位でメモ化して取得する。取得できなければ null。
 *
 * null は「加入状態が不明」であって「無料」ではない。DEFAULT_PRO_STATUS へ倒してよいのは
 * 訴求 LP のように加入状態を断定しない読み取り専用画面だけで、加入状態や課金内容を
 * ユーザーに提示する画面は getCachedProStatusResult() で unauthorized / error を区別すること。
 */
export const getCachedProStatus = async (): Promise<ProStatus | null> => {
  const result = await getCachedProStatusResult();
  return result.status === "ok" ? result.proStatus : null;
};
