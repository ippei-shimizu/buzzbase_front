/**
 * 練習スケジュール（予定）の型定義。
 * back/app/serializers/v2/schedule_serializer.rb のレスポンスに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

/** 予定の種別。back の Schedule::EVENT_TYPES と完全一致させる。 */
export type ScheduleEventType = "self_practice" | "practice" | "game" | "other";

/**
 * 予定に紐づく練習メニュー1件。
 * name / unit_label は practice_menu から都度引く表示用の値で、
 * メニューが削除されている場合は null になる。
 */
export interface ScheduleMenu {
  practice_menu_id: number;
  name: string | null;
  unit_label: string | null;
  /** back は float カラムのため文字列化されず number で返る。 */
  target_value: number | null;
}

export interface Schedule {
  id: number;
  /** back は未設定時にメニューセット名へフォールバックした表示用タイトルを返す。 */
  title: string | null;
  /** "1,3,5"（月=1〜日=7）。単発予定は null。 */
  days_of_week: string | null;
  /** "2026-07-11"。繰り返し予定は null。 */
  planned_on: string | null;
  /** "06:00"。時刻未設定（終日）は null。 */
  scheduled_time: string | null;
  event_type: ScheduleEventType;
  /** days_of_week を持つ（毎週繰り返し）か。 */
  recurring: boolean;
  menu_set_id: number | null;
  game_result_id: number | null;
  note: string | null;
  notification_enabled: boolean;
  active: boolean;
  /** カスタム通知文。Pro 以外が送っても back 側で無視されるため null で返る。 */
  notification_message: string | null;
  /** menu_set_id があればセット内メニュー、無ければ個別紐付けを展開したもの。 */
  menus: ScheduleMenu[];
  /**
   * この予定に対して練習ログが記録済みの practice_menu_id 一覧。
   * 変更すると記録済みログとの「済」判定の整合が壊れるため、編集画面では操作不可にする。
   */
  logged_practice_menu_ids: number[];
}

/**
 * 予定の作成・更新パラメータ（back の schedule_params に対応）。
 * days_of_week と planned_on はどちらか一方のみ指定できる（back のモデルバリデーション）。
 */
export interface ScheduleInput {
  title?: string | null;
  days_of_week?: string | null;
  planned_on?: string | null;
  scheduled_time?: string | null;
  event_type?: ScheduleEventType;
  menu_set_id?: number | null;
  note?: string | null;
  notification_enabled?: boolean;
  notification_message?: string | null;
  /**
   * 個別に紐付ける練習メニュー。渡すと既存の紐付けを全置換し、省略すると維持される。
   * 他ユーザーの practice_menu_id は back 側でエラーにならず黙って除外される。
   */
  menus?: { practice_menu_id: number; target_value?: number | null }[];
}
