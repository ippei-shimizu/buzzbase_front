import type { DecimalValue } from "@app/types/practice";

/**
 * ヒートマップ1日分。back の V2::ActivityLogSerializer と一致させる。
 * 活動が無かった日はレコード自体が存在しないため、日付の穴埋めは front 側で行う。
 */
export interface ActivityLog {
  activity_date: string;
  /**
   * 活動量の段階（0〜4）。
   * どの記録量が何段階目になるかは back（Activities::DailyActivityRecalculator）が決めるため、
   * front は閾値を持たず、この値を色と説明ラベルへ写すだけにする。
   */
  intensity_level: number;
  has_game: boolean;
  total_swing_count: DecimalValue;
  practice_menu_count: DecimalValue;
}

/**
 * GET /api/v2/activity_logs のレスポンス。
 *
 * `from` / `to` は **back がクランプした後** の実際の集計期間で、リクエストした期間とは限らない
 * （無料プランでは直近30日へ切り詰められる）。ヒートマップの描画範囲はこの値を正とする。
 * streak 系の3つは期間クランプの影響を受けず、常に全期間で算出される。
 */
export interface ActivityHeatmap {
  from: string;
  to: string;
  current_streak_days: number;
  longest_streak_days: number;
  total_active_days: number;
  data: ActivityLog[];
}
