import type { FeatureFlagKey } from "@app/types/featureFlags";
import { cache } from "react";
import { getFeatureFlags } from "./actions";

/**
 * Feature Flag をリクエスト単位でメモ化して評価する。
 * 同一リクエスト内で複数の Server Component が同じキーを見ても API アクセスは1回に収まる。
 *
 * flag の値はキャッシュしない（fetch は no-store）。Flipper は actor（ログイン中ユーザー）
 * ごとに評価されるため ISR で共有すると別ユーザーの判定を配ってしまい、さらに kill switch を
 * 切っても revalidate 期間中は機能が露出し続ける。
 *
 * 静的生成を捨てられないルートからは呼ばないこと。認証ヘッダーのために cookies() を読んだ時点で
 * そのルートは dynamic 扱いになる。
 */
export const getCachedFeatureFlag = cache(
  async (key: FeatureFlagKey): Promise<boolean> => {
    const flags = await getFeatureFlags([key]);
    return flags[key];
  },
);
