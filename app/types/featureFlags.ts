/**
 * back の FeatureFlagsController::PUBLIC_KEYS と一致させる。
 * キーを増やすときは back のホワイトリストも同時に更新する（未知キーはレスポンスに含まれない）。
 */
export type FeatureFlagKey = "pro_features" | "cancellation_survey";

/**
 * ビューアに対する flag の判定結果。
 *
 * back の flag API は認証必須で、Flipper は actor（ログイン中ユーザー）ごとに評価する。
 * つまり未認証・API 障害・判定未完了では「無効」だと確定できない。この状態を
 * `"indeterminate"` として `"disabled"` と区別する。
 *
 * kill switch として機能を畳む側は `"disabled"` だけを見る（判定不能で畳むと、cookie が
 * 届かないだけ / API が詰まっただけのリクエストまで巻き添えになる）。
 * 逆に導線を出す側は `"enabled"` だけを見る。
 */
export type FeatureFlagDecision = "enabled" | "disabled" | "indeterminate";

/**
 * 要求したキーが必ず揃った判定結果。
 * 「キーが無い＝判定不能」を呼び出し側に伝播させず、常に FeatureFlagDecision で扱えるようにする。
 */
export type FeatureFlagDecisions<K extends FeatureFlagKey = FeatureFlagKey> =
  Record<K, FeatureFlagDecision>;

/**
 * 判定不能を「無効」に倒した boolean 版。
 * 機能を出すか止めるかの二択しかない呼び出し側（決済ゲートなど）が使う。
 */
export type FeatureFlags<K extends FeatureFlagKey = FeatureFlagKey> = Record<
  K,
  boolean
>;
