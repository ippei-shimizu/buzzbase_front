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
  /** 紐づく練習セッション配下の練習ログ件数。back が集計して返す。 */
  practice_logs_count: number;
  /** 紐づくノート件数。back が集計して返す。 */
  notes_count: number;
  /** 練習セッションのある日の distinct 日数。back が集計して返す。 */
  active_days: number;
  created_at: string;
}

/**
 * 課題の作成・更新パラメータ。
 * back の Strong Parameters（title / category / purpose / status / achieved_on / sort_order）に対応する。
 * 更新時は変更したいキーだけを含める。
 */
export interface ImprovementThemeInput {
  title?: string;
  category?: string | null;
  purpose?: string | null;
  status?: ImprovementThemeStatus;
  achieved_on?: string | null;
  sort_order?: number;
}
