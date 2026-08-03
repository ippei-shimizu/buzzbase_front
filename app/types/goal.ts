/**
 * 目標ドメインの型定義。
 * back/app/serializers/v2/goal_serializer.rb と back/app/models/goal.rb に対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

import type { DecimalValue } from "@app/types/practice";

/** 目標の対象期間。back の Goal::PERIOD_TYPES と完全一致させる。 */
export type GoalPeriodType =
  | "season"
  | "monthly"
  | "tournament"
  | "weekly"
  | "yearly"
  | "custom";

/** 達成条件。back の Goal::COMPARISON_TYPES と完全一致させる。 */
export type GoalComparison = "greater_than" | "less_than";

/**
 * 目標の種類。back の Goal::KINDS と完全一致させる。
 * numeric: 指標を自動集計する数値目標 / qualitative: 達成・未達で管理する定性目標 /
 * manual: 指標名・現在値をユーザーが手入力する自由指標。
 */
export type GoalKind = "numeric" | "qualitative" | "manual";

/** 自動集計できる指標。back の Goal::METRIC_KEYS と完全一致させる。 */
export type GoalMetricKey =
  | "practice_days"
  | "total_swing_count"
  | "game_count"
  | "menu_practice_days"
  | "batting_average"
  | "on_base_percentage"
  | "slugging_percentage"
  | "ops"
  | "hits"
  | "home_runs"
  | "runs_batted_in"
  | "runs_scored"
  | "stolen_bases"
  | "era"
  | "whip"
  | "strikeouts"
  | "wins"
  | "saves";

/**
 * 目標1件。
 *
 * 数値項目を DecimalValue で受けるのは、back のカラム型が float から decimal へ変わると
 * JSON が文字列（"0.3"）になり、素の number 型では `"0.3" * 100` のような事故が起きるため。
 * 表示・計算の前に必ず parseDecimal を通す。
 */
export interface Goal {
  id: number;
  title: string;
  kind: GoalKind;
  period_type: GoalPeriodType;
  season_id: number | null;
  tournament_id: number | null;
  /** 集計対象期間の開始日（YYYY-MM-DD）。season / tournament は持たない。 */
  month_start: string | null;
  deadline: string;
  metric_key: GoalMetricKey | null;
  target_value: DecimalValue | null;
  comparison_type: GoalComparison;
  practice_menu_id: number | null;
  practice_menu_name: string | null;
  custom_metric_label: string | null;
  custom_unit: string | null;
  manual_current_value: DecimalValue;
  is_achieved: boolean;
  /** 期限到来後に FinalizeGoalsJob が確定させたか。確定後は編集・達成操作をさせない。 */
  is_finalized: boolean;
  achieved_value: DecimalValue | null;
  current_value: DecimalValue;
  progress_percent: number;
  days_remaining: number;
}

/**
 * 新規作成で送る属性。back の GoalsController#goal_params と一致させる。
 */
export interface GoalInput {
  title: string;
  kind: GoalKind;
  period_type: GoalPeriodType;
  season_id?: number | null;
  tournament_id?: number | null;
  month_start?: string | null;
  deadline: string;
  metric_key?: GoalMetricKey | null;
  target_value?: number | null;
  comparison_type?: GoalComparison;
  practice_menu_id?: number | null;
  custom_metric_label?: string | null;
  custom_unit?: string | null;
  manual_current_value?: number;
}

/**
 * 更新で送れる属性。back の GoalsController#update_params と一致させる。
 *
 * kind / period_type / season_id / tournament_id / metric_key / comparison_type /
 * practice_menu_id は作成後に変更できず（Pro 制限の回避防止と集計整合のため back が
 * 許可パラメータから外している）、送っても黙って無視される。
 * 「編集できたのに保存されない」を型レベルで防ぐため、更新の入力型からは持たない。
 */
export interface GoalUpdateInput {
  title: string;
  month_start?: string | null;
  deadline: string;
  target_value?: number | null;
  custom_metric_label?: string | null;
  custom_unit?: string | null;
  manual_current_value?: number;
}
