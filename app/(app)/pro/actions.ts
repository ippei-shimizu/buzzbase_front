"use server";

import type {
  EntitlementCheck,
  EntitlementsResponse,
  ProStatus,
} from "../../types/pro";
import { cookies } from "next/headers";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";

async function getAuthHeaders(): Promise<Record<string, string> | null> {
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

/**
 * 現在ユーザーの Pro 加入状態と保有 entitlement を取得する。
 * 未認証・API 失敗時は null を返す。UI 側で DEFAULT_PRO_STATUS にフォールバックする想定。
 */
export async function getProStatus(): Promise<ProStatus | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/status`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Pro status API error:", response.status);
      return null;
    }

    return (await response.json()) as ProStatus;
  } catch (error) {
    captureServerActionError(error, { action: "getProStatus" });
    return null;
  }
}

/**
 * 全 entitlement キーごとの granted フラグを取得する。
 * 個別画面で「この機能が利用可能か」のチェックリスト的に使う。
 */
export async function getEntitlements(): Promise<EntitlementCheck[] | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/entitlements`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Pro entitlements API error:", response.status);
      return null;
    }

    const body = (await response.json()) as EntitlementsResponse;
    return body.entitlements;
  } catch (error) {
    captureServerActionError(error, { action: "getEntitlements" });
    return null;
  }
}

export type ProPlan = "monthly" | "yearly";

export type StartProCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | {
      ok: false;
      error:
        | "unauthorized"
        | "already_subscribed"
        | "invalid_plan"
        | "stripe_api_error"
        | "unknown";
    };

/**
 * Stripe Checkout Session を作成し、リダイレクト先 URL を返す。
 * baseUrl は呼び出し元クライアント側で `window.location.origin` を渡す（Server 側からはホスト推測しないため）。
 */
export async function startProCheckout(args: {
  plan: ProPlan;
  baseUrl: string;
}): Promise<StartProCheckoutResult> {
  const { plan, baseUrl } = args;
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        plan,
        success_url: `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pro/cancel`,
      }),
    });

    if (response.status === 401) return { ok: false, error: "unauthorized" };
    if (response.status === 409) {
      return { ok: false, error: "already_subscribed" };
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (body.error === "invalid_plan") {
        return { ok: false, error: "invalid_plan" };
      }
      if (body.error === "stripe_api_error") {
        return { ok: false, error: "stripe_api_error" };
      }
      return { ok: false, error: "unknown" };
    }

    const body = (await response.json()) as { checkout_url: string };
    return { ok: true, checkoutUrl: body.checkout_url };
  } catch (error) {
    captureServerActionError(error, { action: "startProCheckout" });
    return { ok: false, error: "unknown" };
  }
}

/**
 * RevenueCat と Rails の Pro 状態を再同期する。
 * 本Issueはスタブで last_synced_at の更新のみ。実同期ロジックは #318 で実装する。
 */
export async function syncProStatus(): Promise<ProStatus | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;

    // POST はそもそも Next.js のフェッチキャッシュ対象外。cache: "no-store" は不要。
    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/sync`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      console.error("Pro sync API error:", response.status);
      return null;
    }

    return (await response.json()) as ProStatus;
  } catch (error) {
    captureServerActionError(error, { action: "syncProStatus" });
    return null;
  }
}
