"use server";

import type { CancellationReason } from "@app/types/cancellationFeedback";
import type { PlanType } from "@app/types/pro";
import { cookies } from "next/headers";
import { captureServerActionError } from "../../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../../constants/api";

// Rails 側が詰まったときに Server Action を無期限に待たせないための上限。
// 解約・プラン変更はどちらも Stripe API を同期的に叩くため同じ上限を使う。
const SUBSCRIPTION_API_TIMEOUT_MS = 10000;

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
      signal: AbortSignal.timeout(SUBSCRIPTION_API_TIMEOUT_MS),
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

export type ChangeProPlanError =
  | "unauthorized"
  | "no_active_subscription"
  | "invalid_plan"
  | "stripe_api_error"
  | "unknown";

export type ChangeProPlanResult =
  | { ok: true }
  | { ok: false; error: ChangeProPlanError };

/**
 * Web（Stripe）で加入したサブスクリプションの契約周期を月額↔年額で切り替える。
 *
 * back は Stripe に proration_behavior: create_prorations で委譲するだけなので、
 * 差額は Stripe が日割り計算し現金返金は発生しない。ローカルの plan_type は
 * RevenueCat の PRODUCT_CHANGE webhook で追って更新されるため、成功直後に
 * 再取得しても新しいプランが反映されているとは限らない。
 *
 * ストア課金（ios / android）は Stripe サブスクリプションを持たず
 * no_active_subscription になるため、このアクションを呼んではいけない。
 */
export async function changeProPlan(
  plan: PlanType,
): Promise<ChangeProPlanResult> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/subscription`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ plan }),
      signal: AbortSignal.timeout(SUBSCRIPTION_API_TIMEOUT_MS),
    });

    if (response.ok) return { ok: true };
    if (response.status === 401) return { ok: false, error: "unauthorized" };

    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (body.error === "no_active_subscription") {
      return { ok: false, error: "no_active_subscription" };
    }
    if (body.error === "invalid_plan") {
      return { ok: false, error: "invalid_plan" };
    }
    if (body.error === "stripe_api_error") {
      return { ok: false, error: "stripe_api_error" };
    }
    return { ok: false, error: "unknown" };
  } catch (error) {
    captureServerActionError(error, { action: "changeProPlan" });
    return { ok: false, error: "unknown" };
  }
}

export type CancellationFeedbackError =
  | "unauthorized"
  | "survey_disabled"
  | "reason_required"
  | "invalid_reason"
  | "note_too_long"
  | "unknown";

export type CancellationFeedbackResult =
  | { ok: true }
  | { ok: false; error: CancellationFeedbackError };

// back のバリデーションエラーコード。ここに無いコードは unknown に畳んで、
// back 側の追加が未知のまま UI の分岐に混ざらないようにする。
const CANCELLATION_FEEDBACK_ERRORS = [
  "reason_required",
  "invalid_reason",
  "note_too_long",
] as const;

/**
 * 解約理由アンケートの回答を送信する。
 *
 * back は Flipper :cancellation_survey が無効なユーザーに対してエンドポイント自体を隠し
 * 404 を返す。呼び出し側はこれをエラーとして見せず、アンケートを畳むこと（解約自体は
 * すでに受理済みで、アンケートは任意回答のため）。
 *
 * @param input `reason` は back の enum と一致する値。`note` は空なら送信しない。
 * @returns 成功なら `{ ok: true }`、失敗は原因を判別できる discriminated union
 */
export async function submitCancellationFeedback(input: {
  reason: CancellationReason;
  note?: string;
}): Promise<CancellationFeedbackResult> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    const note = input.note?.trim();
    const response = await fetch(
      `${RAILS_API_URL}/api/v1/pro/cancellation_feedbacks`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(
          note ? { reason: input.reason, note } : { reason: input.reason },
        ),
        cache: "no-store",
        signal: AbortSignal.timeout(SUBSCRIPTION_API_TIMEOUT_MS),
      },
    );

    if (response.ok) return { ok: true };
    if (response.status === 401) return { ok: false, error: "unauthorized" };
    if (response.status === 404) return { ok: false, error: "survey_disabled" };

    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    const known = CANCELLATION_FEEDBACK_ERRORS.find(
      (code) => code === body.error,
    );
    if (known) return { ok: false, error: known };
    return { ok: false, error: "unknown" };
  } catch (error) {
    captureServerActionError(error, { action: "submitCancellationFeedback" });
    return { ok: false, error: "unknown" };
  }
}
