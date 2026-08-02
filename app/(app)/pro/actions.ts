"use server";

import type {
  EntitlementCheck,
  EntitlementsResponse,
  ProStatus,
} from "../../types/pro";
import { cookies } from "next/headers";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";
import { getFeatureFlags } from "../../featureFlags/actions";

// Rails 側が詰まったときにレンダーや Server Action を無期限に待たせないための上限。
const PRO_API_TIMEOUT_MS = 5000;

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
 * Pro 加入状態の取得結果。
 * トークン失効（unauthorized）と通信・サーバー障害（error）はユーザーが取るべき行動が
 * 「再ログイン」と「再試行」で異なるため、null に畳まず呼び出し側で区別できるようにする。
 */
export type ProStatusResult =
  | { status: "ok"; proStatus: ProStatus }
  | { status: "unauthorized" }
  | { status: "error" };

/**
 * 現在ユーザーの Pro 加入状態と保有 entitlement を、失敗理由付きで取得する。
 * 加入状態そのものをユーザーに提示する画面（サブスクリプション管理など）は、
 * 失敗を無料状態に倒さずこの戻り値で文言を出し分けること。
 */
export async function getProStatusResult(): Promise<ProStatusResult> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "unauthorized" };

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/status`, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(PRO_API_TIMEOUT_MS),
    });

    // 401 はトークン失効という想定内の状態。全ページのレンダーごとに記録すると
    // 本当のエラーが埋もれるため、ログには残さない。
    if (response.status === 401) return { status: "unauthorized" };

    if (!response.ok) {
      console.error("Pro status API error:", response.status);
      return { status: "error" };
    }

    return { status: "ok", proStatus: (await response.json()) as ProStatus };
  } catch (error) {
    captureServerActionError(error, { action: "getProStatus" });
    return { status: "error" };
  }
}

/**
 * 現在ユーザーの Pro 加入状態と保有 entitlement を取得する。
 * 未認証・API 失敗時は null を返す。
 *
 * null は「加入状態が不明」であって「無料」ではない。DEFAULT_PRO_STATUS へ倒してよいのは
 * 訴求 LP のように加入状態を断定しない読み取り専用画面だけで、加入状態や課金内容を
 * ユーザーに提示する画面は getProStatusResult() で失敗理由まで受け取ること。
 */
export async function getProStatus(): Promise<ProStatus | null> {
  const result = await getProStatusResult();
  return result.status === "ok" ? result.proStatus : null;
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
      signal: AbortSignal.timeout(PRO_API_TIMEOUT_MS),
    });

    if (response.status === 401) return null;

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
        | "feature_disabled"
        | "already_subscribed"
        | "invalid_plan"
        | "stripe_api_error"
        | "unknown";
    };

/**
 * Stripe Checkout Session を作成し、リダイレクト先 URL を返す。
 * success_url / cancel_url の元になるホストは Server 側で `APP_URL` 環境変数から決定する。
 * クライアント発の値（window.location.origin など）は受け取らない: Server Action は POST で
 * 直接叩けるため任意ドメインを差し込まれると Stripe 経由のフィッシングに繋がる。
 *
 * pro_features が無効なら Stripe を呼ばずに `feature_disabled` を返す。back の checkout API は
 * flag を見ていないため、Web の課金経路を止める実質的なゲートはここだけになる。
 */
export async function startProCheckout(args: {
  plan: ProPlan;
}): Promise<StartProCheckoutResult> {
  const { plan } = args;
  const appUrl = process.env.APP_URL ?? "http://localhost:8100";
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    // flag は actor ごとの評価なので、認証を確かめてから引く。
    // 未認証を先に弾かないと「ログインが必要」を「販売停止中」と誤って伝えることになる。
    const flags = await getFeatureFlags(["pro_features"]);
    if (!flags.pro_features) return { ok: false, error: "feature_disabled" };

    const response = await fetch(`${RAILS_API_URL}/api/v1/pro/checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        plan,
        success_url: `${appUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pro/cancel`,
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
