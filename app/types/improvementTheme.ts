/**
 * 課題（改善テーマ）の型。
 * back/app/serializers/v2/improvement_theme_serializer.rb のレスポンスに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

/** 課題の取組状況。back の ImprovementTheme::STATUSES と完全一致させる。 */
export type ImprovementThemeStatus = "open" | "achieved" | "archived";

export interface ImprovementTheme {
  id: number;
  title: string;
  category: string | null;
  purpose: string | null;
  status: ImprovementThemeStatus;
  started_on: string;
  achieved_on: string | null;
  sort_order: number;
  practice_logs_count: number;
  notes_count: number;
  active_days: number;
  created_at: string;
}
