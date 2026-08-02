import type {
  FeatureFlagDecision,
  FeatureFlagKey,
} from "@app/types/featureFlags";
import { cache } from "react";
import { getFeatureFlagDecisions } from "./actions";

/**
 * Feature Flag をリクエスト単位でメモ化して評価する。
 * 同一リクエスト内で複数の Server Component が同じキーを見ても API アクセスは1回に収まる。
 *
 * 判定不能（未認証 / API 障害）を `"disabled"` に丸めないのは、認証 cookie が SameSite=Strict
 * だから。検索結果や Stripe からのトップレベル遷移ではログイン済みでもサーバーに cookie が
 * 届かず、丸めると「cookie が届かなかっただけ」のリクエストが kill switch の巻き添えになる。
 *
 * flag の値はキャッシュしない（fetch は no-store）。Flipper は actor（ログイン中ユーザー）
 * ごとに評価されるため ISR で共有すると別ユーザーの判定を配ってしまい、さらに kill switch を
 * 切っても revalidate 期間中は機能が露出し続ける。
 *
 * 静的生成を捨てられないルートからは呼ばないこと。認証ヘッダーのために cookies() を読んだ時点で
 * そのルートは dynamic 扱いになる。
 */
export const getCachedFeatureFlagDecision = cache(
  async (key: FeatureFlagKey): Promise<FeatureFlagDecision> => {
    const decisions = await getFeatureFlagDecisions([key]);
    return decisions[key];
  },
);
