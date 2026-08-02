"use server";

import type {
  FeatureFlagDecisions,
  FeatureFlagKey,
  FeatureFlags,
} from "@app/types/featureFlags";
import { RAILS_API_URL } from "@app/constants/api";
import { getAuthHeaders } from "@app/services/v2/authHeaders";
import { captureServerActionError } from "../../lib/sentry-helpers";

// kill switch の判定を Rails の詰まりに巻き込ませないための上限。
// 超過分は「判定不能」として扱う。
const FEATURE_FLAGS_API_TIMEOUT_MS = 3000;

function allIndeterminate<K extends FeatureFlagKey>(
  keys: readonly K[],
): FeatureFlagDecisions<K> {
  return Object.fromEntries(
    keys.map((key) => [key, "indeterminate"]),
  ) as FeatureFlagDecisions<K>;
}

/**
 * 指定キーの Feature Flag をまとめて評価する。
 *
 * back が boolean を返したキーだけが `"enabled"` / `"disabled"` になる。判定できなかった
 * ケース（未認証 / 401 / API エラー / タイムアウト / レスポンスにキーが無い / boolean 以外）は
 * すべて `"indeterminate"` に倒す。「無効と確定した」場合と区別できるので、判定不能で
 * 誤動作させたくない分岐（公開ページを畳むか等）に使える。
 *
 * @param keys 評価したいキー。back の PUBLIC_KEYS 外は常に `"indeterminate"` になる。
 * @returns 要求したキーが必ず揃った `{ key: FeatureFlagDecision }`
 */
export async function getFeatureFlagDecisions<K extends FeatureFlagKey>(
  keys: readonly K[],
): Promise<FeatureFlagDecisions<K>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return allIndeterminate(keys);

    const query = keys
      .map((key) => `keys[]=${encodeURIComponent(key)}`)
      .join("&");
    const response = await fetch(
      `${RAILS_API_URL}/api/v1/feature_flags?${query}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(FEATURE_FLAGS_API_TIMEOUT_MS),
      },
    );

    // 401 はトークン失効という想定内の状態。レンダーのたびに記録すると本当の障害が埋もれる。
    if (response.status === 401) return allIndeterminate(keys);

    if (!response.ok) {
      console.error("Feature flags API error:", response.status);
      return allIndeterminate(keys);
    }

    // back はフラット形式 `{ pro_features: true }` を返す。
    const body = (await response.json()) as Partial<Record<K, unknown>>;
    return Object.fromEntries(
      keys.map((key) => {
        if (body[key] === true) return [key, "enabled"];
        if (body[key] === false) return [key, "disabled"];
        return [key, "indeterminate"];
      }),
    ) as FeatureFlagDecisions<K>;
  } catch (error) {
    captureServerActionError(error, { action: "getFeatureFlagDecisions" });
    return allIndeterminate(keys);
  }
}

/**
 * Feature Flag を boolean で評価する。`"enabled"` 以外はすべて false。
 *
 * flag は kill switch なので、判定不能を「有効」と誤認すると止めたい機能が露出し続ける。
 * 機能を出すか止めるかの二択しかない呼び出し側（決済ゲートなど）はこちらを使う。
 *
 * @param keys 評価したいキー。back の PUBLIC_KEYS 外は常に false になる。
 * @returns 要求したキーが必ず揃った `{ key: boolean }`
 */
export async function getFeatureFlags<K extends FeatureFlagKey>(
  keys: readonly K[],
): Promise<FeatureFlags<K>> {
  const decisions = await getFeatureFlagDecisions(keys);
  return Object.fromEntries(
    keys.map((key) => [key, decisions[key] === "enabled"]),
  ) as FeatureFlags<K>;
}
