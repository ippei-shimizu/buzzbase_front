"use server";

import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { getAuthHeaders } from "./authHeaders";

/**
 * ログイン中ユーザーの id を取得する（GET /api/v1/users/current）。
 * 未ログイン・失敗時は null（呼び出し側で「自分ではない」扱いにフォールバック）。
 */
export async function getCurrentUserIdV2(): Promise<number | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;

    const response = await fetch(`${RAILS_API_URL}/api/v1/users/current`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return null;

    const body = (await response.json()) as { id?: number };
    return body.id ?? null;
  } catch (error) {
    captureServerActionError(error, { action: "getCurrentUserIdV2" });
    return null;
  }
}
