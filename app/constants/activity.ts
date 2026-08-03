/**
 * 草グラフ（アクティビティヒートマップ）と Streak の定数。
 * 見た目・節目の数値は mobile（components/grass、StreakHeaderSection）と一致させる。
 */

/** ヒートマップで要求する期間の長さ（今日を含む日数）。back の既定値と同じ 365 日。 */
export const GRASS_HISTORY_DAYS = 365;

/**
 * 無料プランで見られる期間（今日を含む日数）。
 * back の Api::V2::ActivityLogsController::FREE_WINDOW_DAYS と一致させる。
 * 実際のクランプは back が行うため、front はこの値を文言にしか使わない。
 */
export const FREE_GRASS_WINDOW_DAYS = 30;

/**
 * 活動量 0〜4 の色。index が intensity_level に対応する。
 * L0 は「未記録」で、カード背景（#424242）と区別できる明るさにしている。
 * mobile の INTENSITY_COLORS と同じ値。
 */
export const ACTIVITY_LEVEL_COLORS = [
  "#4A4A4A",
  "#14532D",
  "#166534",
  "#16A34A",
  "#22C55E",
] as const;

/**
 * 活動量 0〜4 の説明ラベル。
 * 色の濃淡だけで段階を伝えると色覚特性のあるユーザーが読み取れないため、
 * キャプション・aria-label・凡例にこの言葉を必ず添える。
 */
export const ACTIVITY_LEVEL_LABELS = [
  "なし",
  "少なめ",
  "ふつう",
  "多め",
  "たっぷり",
] as const;

/** 活動量の段階数（0 を含む）。 */
export const ACTIVITY_LEVEL_COUNT = ACTIVITY_LEVEL_COLORS.length;

/** 通算活動日数の節目。mobile の ACTIVE_DAY_MILESTONES と同じ。 */
export const ACTIVE_DAY_MILESTONES = [
  10, 30, 50, 100, 150, 200, 300, 365, 500, 1000,
] as const;

/** 素振り累計本数の節目。mobile の SWING_MILESTONES と同じ。 */
export const SWING_MILESTONES = [
  1000, 5000, 10_000, 30_000, 50_000, 100_000,
] as const;
