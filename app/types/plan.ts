/**
 * 予定（schedule）を日付軸に展開したビュー用の型。
 * back/app/controllers/api/v2/plans_controller.rb の by_date / calendar レスポンスに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

import type { PracticeUnit } from "@app/types/practice";
import type { ScheduleEventType } from "@app/types/schedule";

/**
 * 予定に紐づく練習メニュー1件（by_date）。
 * done は「その日・その予定（schedule_id）で練習ログが作られているか」。
 * 同じメニューが複数の予定にあっても予定ごとに独立して判定される
 * （back の done_menu_ids_by_schedule_on が schedule_id 単位で畳み込むため）。
 */
export interface PlanMenu {
  practice_menu_id: number;
  name: string | null;
  /** 入力ウィジェットの出し分けに使う。メニューが削除されている場合は null。 */
  unit: PracticeUnit | null;
  unit_label: string | null;
  target_value: number | null;
  sort_order: number;
  done: boolean;
}

/**
 * 特定日に展開された予定。「今日のやること」1ブロックに対応する。
 * 繰り返し（days_of_week）と単発（planned_on）は back が同じ日付へ集約して返すため、
 * front で曜日展開はしない。
 */
export interface Plan {
  id: number;
  title: string | null;
  event_type: ScheduleEventType;
  /** "06:00"。終日（時刻未設定）は null。 */
  scheduled_time: string | null;
  /** "12:30"。未設定は null。 */
  end_time: string | null;
  recurring: boolean;
  menu_set_id: number | null;
  game_result_id: number | null;
  note: string | null;
  menus: PlanMenu[];
  /** 予定内の全メニューが当日ログ済みか。メニュー未設定の予定は false。 */
  done: boolean;
}

/**
 * カレンダー1マスに並ぶ予定 1 件。
 * 繰り返し予定（days_of_week）は back が日付ごとに展開して返すため、
 * 同じ schedule_id が複数の date で現れる。front で曜日展開はしない。
 */
export interface CalendarEntry {
  /** "2026-07-06"。 */
  date: string;
  event_type: ScheduleEventType;
  /** back の display_title（未設定時はメニューセット名）。どちらも無ければ null。 */
  title: string | null;
  schedule_id: number;
  /** "06:00"。終日（時刻未設定）は null。 */
  scheduled_time: string | null;
  /** "12:30"。未設定は null。 */
  end_time: string | null;
}

export interface CalendarResponse {
  entries: CalendarEntry[];
}
