/**
 * 練習ドメインの型定義。
 * back/app/serializers/v2/*（practice_menu / practice_log / practice_session / condition_log）と
 * back/app/services/practices/*（menu_summary / menu_trend / overall_summary）のレスポンスに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

/**
 * back の decimal カラムは ActiveModel::Serializer の JSON 化で文字列として返る
 * （例: amount 200 → "200.0"）。計算・表示の前に必ず数値化が要るため型で明示する。
 * 集計系（MenuSummary / MenuTrend / PracticeOverview）は Ruby 側で Float 化済みのため素の number。
 */
export type DecimalValue = number | string;

/** 練習メニューのカテゴリ。back の PracticeMenu::CATEGORIES と完全一致させる。 */
export type PracticeCategory =
  | "batting"
  | "pitching"
  | "defense"
  | "baserunning"
  | "training"
  | "strength"
  | "care"
  | "other";

/** 練習量の計測単位。back の PracticeMenu::UNITS と完全一致させる。 */
export type PracticeUnit = "count" | "minutes" | "distance" | "weight_reps";

/** 練習ログの発生源。back の PracticeLog::SOURCES と完全一致させる。 */
export type PracticeLogSource = "manual" | "shadow_swing";

/** 練習メニューのマスタ（ユーザーごと）。 */
export interface PracticeMenu {
  id: number;
  name: string;
  category: PracticeCategory;
  unit: PracticeUnit;
  unit_label: string | null;
  default_value: DecimalValue | null;
  is_favorite: boolean;
  sort_order: number;
}

/** 練習量の1件の記録。メニュー削除後も履歴を保てるよう名称・単位をスナップショットして持つ。 */
export interface PracticeLog {
  id: number;
  practice_menu_id: number | null;
  schedule_id: number | null;
  logged_on: string;
  amount: DecimalValue | null;
  weight: DecimalValue | null;
  menu_name: string;
  unit_label: string | null;
  source: PracticeLogSource;
  memo: string | null;
  created_at: string;
}

/** コンディションに記録する故障箇所。back では jsonb 配列で保持する。 */
export interface Injury {
  part: string;
  memo?: string | null;
}

/**
 * その日のコンディション（1日1件）。
 * 記録・参照ともに Pro 限定（entitlement: detailed_condition_log）。
 */
export interface ConditionLog {
  id: number;
  logged_on: string;
  /** 疲労度。back の ConditionLog::LEVEL_RANGE と同じく 1〜4。 */
  fatigue_level: number | null;
  /** 体の状態。back の ConditionLog::LEVEL_RANGE と同じく 1〜4。 */
  physical_level: number | null;
  sleep_hours: DecimalValue | null;
  mood: string | null;
  memo: string | null;
  injuries: Injury[];
}

/** 日次の練習セッション。1日（logged_on）の量ログとコンディションを束ねる。 */
export interface PracticeSession {
  id: number;
  logged_on: string;
  memo: string | null;
  improvement_theme_ids: number[];
  practice_logs: PracticeLog[];
  condition: ConditionLog | null;
  created_at: string;
}

/** メニュー別の積み上げサマリー。total_volume は重さ×回数のメニューのみ値を持つ。 */
export interface MenuSummary {
  practice_menu_id: number | null;
  menu_name: string;
  unit: PracticeUnit;
  unit_label: string | null;
  total_amount: number;
  total_volume: number | null;
  this_month_amount: number;
  this_month_volume: number | null;
  days_count: number;
  last_logged_on: string | null;
}

/** 推移グラフの1バケット（年 / 月 / 日のいずれか）。 */
export interface MenuTrendBucket {
  /** 年は "2026"、月は "2026-08"、日は "2026-08-03" 形式。 */
  period: string;
  total_amount: number;
  total_volume: number;
  days_count: number;
}

/**
 * 単一メニューの推移（年別・月別・日別）。
 * by_day は back 側で直近 60 件に制限される。
 */
export interface MenuTrend {
  menu: {
    id: number;
    name: string;
    unit: PracticeUnit;
    unit_label: string | null;
    is_weight_reps: boolean;
  };
  by_year: MenuTrendBucket[];
  by_month: MenuTrendBucket[];
  by_day: MenuTrendBucket[];
}

/** 練習全体の積み上げ KPI。 */
export interface PracticeOverview {
  total_practice_days: number;
  this_month_practice_days: number;
  total_swing_count: number;
  total_volume: number;
  total_menus: number;
}

/** 練習メニューの作成・更新パラメータ（back の practice_menu_params に対応）。 */
export interface PracticeMenuInput {
  name: string;
  category: PracticeCategory;
  unit: PracticeUnit;
  unit_label?: string | null;
  default_value?: number | null;
  is_favorite?: boolean;
  sort_order?: number;
}

/** 練習ログ単票の作成パラメータ（back の practice_log_params に対応）。 */
export interface PracticeLogInput {
  practice_menu_id: number;
  schedule_id?: number | null;
  logged_on: string;
  amount?: number | null;
  weight?: number | null;
  memo?: string | null;
}

/** セッション保存時の1メニュー項目。practice_menu_id をキーに差分同期される。 */
export interface PracticeSessionItemInput {
  practice_menu_id: number;
  amount?: number | null;
  weight?: number | null;
  memo?: string | null;
}

/** コンディション単体の入力値。 */
export interface ConditionLogInput {
  logged_on: string;
  fatigue_level?: number | null;
  physical_level?: number | null;
  sleep_hours?: number | null;
  mood?: string | null;
  memo?: string | null;
  injuries?: Injury[];
}

/** セッション内のコンディションは logged_on をセッションの日付から決めるため省く。 */
export type ConditionInput = Omit<ConditionLogInput, "logged_on">;

/**
 * 日次セッションの upsert パラメータ（back の session_params に対応）。
 * 同じ logged_on への再送は同一セッションの更新になる。
 */
export interface PracticeSessionInput {
  logged_on: string;
  memo?: string | null;
  improvement_theme_ids?: number[];
  items: PracticeSessionItemInput[];
  condition?: ConditionInput | null;
}

/** 練習記録画面へ事前選択メニュー（目標量つき）を渡すためのパラメータ項目。 */
export interface PresetMenu {
  practice_menu_id: number;
  target_value: number | null;
}
