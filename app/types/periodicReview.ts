import type { CorrelationInsight, InsightDirection } from "@app/types/insight";
import type { DecimalValue } from "@app/types/practice";

export type PeriodicReviewType = "weekly" | "monthly";

// レポートに同梱されるインサイトは「練習と成績のつながり」と同一の JSON なので、
// 型を二重に持たず insight.ts を唯一の定義とし、既存の import 先を壊さないよう再公開する。
export type { CorrelationInsight, InsightDirection };

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
/** 得点圏成績。runners_state 必須の新フォーマット打席のみが母数で、母数 0 なら打率 null。 */
export interface PeriodicReviewScoringPosition {
  batting_average?: DecimalValue | null;
  at_bats?: DecimalValue | null;
  hits?: DecimalValue | null;
}

/** メニュー別の練習量内訳1件。削除済みメニューは menu_name のスナップショットで名寄せされる。 */
export interface PeriodicReviewPracticeMenu {
  name: string;
  count?: DecimalValue | null;
  total_amount?: DecimalValue | null;
  unit_label?: string | null;
}

export interface PeriodicReviewPracticeMenus {
  items?: PeriodicReviewPracticeMenu[] | null;
  /** 上位表示から漏れたメニュー数（back 側で上限に丸めた残り）。 */
  other_count?: DecimalValue | null;
}

/** 期間に重なる目標の進捗スナップショット。kind で current_value の意味が変わる。 */
export interface PeriodicReviewGoal {
  id: number;
  title: string;
  kind?: "numeric" | "qualitative" | "manual";
  metric_key?: string | null;
  custom_metric_label?: string | null;
  current_value?: DecimalValue | null;
  target_value?: DecimalValue | null;
  progress_percent?: DecimalValue | null;
  achieved?: boolean;
  deadline?: string;
}

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
    hits?: DecimalValue | null;
    two_base_hits?: DecimalValue | null;
    three_base_hits?: DecimalValue | null;
    home_runs?: DecimalValue | null;
    stolen_bases?: DecimalValue | null;
    strikeouts?: DecimalValue | null;
    scoring_position?: PeriodicReviewScoringPosition | null;
  } | null;
  /** 登板が無い期間は率系（era / whip / k_per_9）が null。 */
  pitching?: {
    appearances?: DecimalValue | null;
    innings_pitched?: DecimalValue | null;
    era?: DecimalValue | null;
    whip?: DecimalValue | null;
    k_per_9?: DecimalValue | null;
    strikeouts?: DecimalValue | null;
    base_on_balls?: DecimalValue | null;
    hit_by_pitch?: DecimalValue | null;
    hits_allowed?: DecimalValue | null;
    home_runs_allowed?: DecimalValue | null;
    runs_allowed?: DecimalValue | null;
    earned_runs?: DecimalValue | null;
  } | null;
  theme_breakdown?: PeriodicReviewThemeBreakdown[] | null;
  condition?: {
    sleep_hours_avg?: DecimalValue | null;
    fatigue_level_avg?: DecimalValue | null;
    physical_level_avg?: DecimalValue | null;
  } | null;
  practice_menus?: PeriodicReviewPracticeMenus | null;
  note_days?: DecimalValue | null;
  goals?: PeriodicReviewGoal[] | null;
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
