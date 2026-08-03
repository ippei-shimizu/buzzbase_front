/**
 * 予定（schedule）を日付軸に展開したビュー用の型。
 * back/app/controllers/api/v2/plans_controller.rb の calendar レスポンスに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

import type { ScheduleEventType } from "@app/types/schedule";

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
}

export interface CalendarResponse {
  entries: CalendarEntry[];
}
