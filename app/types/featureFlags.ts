/**
 * back の FeatureFlagsController::PUBLIC_KEYS と一致させる。
 * キーを増やすときは back のホワイトリストも同時に更新する（未知キーはレスポンスに含まれない）。
 */
export type FeatureFlagKey = "pro_features" | "cancellation_survey";

/**
 * 要求したキーが必ず揃った評価結果。
 * 「キーが無い＝判定不能」を呼び出し側に伝播させず、常に boolean で扱えるようにする。
 */
export type FeatureFlags<K extends FeatureFlagKey = FeatureFlagKey> = Record<
  K,
  boolean
>;
