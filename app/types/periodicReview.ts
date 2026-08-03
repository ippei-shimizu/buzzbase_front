import type { DecimalValue } from "@app/types/practice";

export type PeriodicReviewType = "weekly" | "monthly";

export type InsightDirection = "positive" | "negative" | "unknown";

/** 相関インサイト（Insights::CorrelationBuilder が生成するカード）。 */
export interface CorrelationInsight {
  key: string;
  /** 自作カードは組み合わせ id を持つ。プリセットは null。 */
  id: number | null;
  title: string;
  body: string;
  metric: string;
  dimension: string;
  direction: InsightDirection;
  strength: string;
  sample_weeks: number;
  sufficient: boolean;
}

export interface PeriodicReviewThemeBreakdown {
  id: number;
  title: string;
  practice_count: number;
}

/**
 * レポート本体（PeriodicReviews::Generator が summary に保存する JSON）。
 *
 * すべてのキーを任意にしているのは、指標を追加する前に生成された古いレポートには
 * キー自体が存在しないため。欠損を 0 として描くと「成績が 0 だった」と誤読されるので、
 * 表示側は必ず「-」へフォールバックする。
 * 数値は decimal 由来で文字列になり得るため DecimalValue で受け、parseDecimal を通す。
 */
export interface PeriodicReviewSummary {
  period_type?: PeriodicReviewType;
  practice_days?: DecimalValue | null;
  total_swings?: DecimalValue | null;
  active_days?: DecimalValue | null;
  streak_current?: DecimalValue | null;
  batting?: {
    batting_average?: DecimalValue | null;
    on_base_percentage?: DecimalValue | null;
    slugging_percentage?: DecimalValue | null;
    ops?: DecimalValue | null;
    previous_batting_average?: DecimalValue | null;
    delta?: DecimalValue | null;
  } | null;
  /** 登板が無い期間は各値 null。 */
  pitching?: {
    innings_pitched?: DecimalValue | null;
    era?: DecimalValue | null;
    whip?: DecimalValue | null;
    k_per_9?: DecimalValue | null;
  } | null;
  theme_breakdown?: PeriodicReviewThemeBreakdown[] | null;
  condition?: {
    sleep_hours_avg?: DecimalValue | null;
    fatigue_level_avg?: DecimalValue | null;
  } | null;
  insight?: CorrelationInsight | null;
}

export interface PeriodicReview {
  id: number;
  period_type: PeriodicReviewType;
  period_start: string;
  period_end: string;
  read: boolean;
  summary: PeriodicReviewSummary;
}
