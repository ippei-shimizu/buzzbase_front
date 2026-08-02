"use server";

import { cookies } from "next/headers";
import { captureServerActionError } from "../../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../../constants/api";

// Rails 側が詰まったときに Server Action を無期限に待たせないための上限。
const CANCEL_API_TIMEOUT_MS = 10000;

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

export type CancelWebSubscriptionError =
  | "unauthorized"
  | "no_active_subscription"
  | "stripe_api_error"
  | "unknown";

export type CancelWebSubscriptionResult =
  | { ok: true }
  | { ok: false; error: CancelWebSubscriptionError };

/**
 * Web（Stripe）で加入したサブスクリプションの解約を申請する。
 * back は cancel_at_period_end を立てるだけで即時失効はしないため、成功後も
 * 次回更新日までは Pro 機能を利用できる。ローカルの status は Stripe webhook 経由で
 * 追って正規化されるので、呼び出し側は解約直後に再取得しても cancelled とは限らない。
 *
 * ストア課金（ios / android）は Stripe サブスクリプションを持たず
 * no_active_subscription になるため、このアクションを呼んではいけない。
 */
export async function cancelWebSubscription(): Promise<CancelWebSubscriptionResult> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/subscription`, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(CANCEL_API_TIMEOUT_MS),
    });

    if (response.ok) return { ok: true };
    if (response.status === 401) return { ok: false, error: "unauthorized" };

    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (body.error === "no_active_subscription") {
      return { ok: false, error: "no_active_subscription" };
    }
    if (body.error === "stripe_api_error") {
      return { ok: false, error: "stripe_api_error" };
    }
    return { ok: false, error: "unknown" };
  } catch (error) {
    captureServerActionError(error, { action: "cancelWebSubscription" });
    return { ok: false, error: "unknown" };
  }
}
