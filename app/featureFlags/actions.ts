"use server";

import type { FeatureFlagKey, FeatureFlags } from "@app/types/featureFlags";
import { RAILS_API_URL } from "@app/constants/api";
import { getAuthHeaders } from "@app/services/v2/authHeaders";
import { captureServerActionError } from "../../lib/sentry-helpers";

// kill switch の判定を Rails の詰まりに巻き込ませないための上限。
// 超過分は「取得失敗」として全 flag が無効側に倒れる。
const FEATURE_FLAGS_API_TIMEOUT_MS = 3000;

function allDisabled<K extends FeatureFlagKey>(
  keys: readonly K[],
): FeatureFlags<K> {
  return Object.fromEntries(keys.map((key) => [key, false])) as FeatureFlags<K>;
}

/**
 * 指定キーの Feature Flag をまとめて評価する。
 *
 * 判定できなかったケース（未認証 / 401 / API エラー / タイムアウト / レスポンスにキーが無い）は
 * すべて false に倒す。flag は kill switch なので、判定不能を「有効」と誤認すると
 * 止めたい機能が露出し続けることになるため。
 *
 * @param keys 評価したいキー。back の PUBLIC_KEYS 外は常に false になる。
 * @returns 要求したキーが必ず揃った `{ key: boolean }`
 */
export async function getFeatureFlags<K extends FeatureFlagKey>(
  keys: readonly K[],
): Promise<FeatureFlags<K>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return allDisabled(keys);

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
    if (response.status === 401) return allDisabled(keys);

    if (!response.ok) {
      console.error("Feature flags API error:", response.status);
      return allDisabled(keys);
    }

    // back はフラット形式 `{ pro_features: true }` を返す。
    const body = (await response.json()) as Partial<Record<K, unknown>>;
    return Object.fromEntries(
      keys.map((key) => [key, body[key] === true]),
    ) as FeatureFlags<K>;
  } catch (error) {
    captureServerActionError(error, { action: "getFeatureFlags" });
    return allDisabled(keys);
  }
}
