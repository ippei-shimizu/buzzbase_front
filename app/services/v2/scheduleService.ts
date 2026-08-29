"use server";

import type { Schedule, ScheduleInput } from "@app/types/schedule";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/schedules";

/**
 * 予定一覧を取得する（GET /api/v2/schedules）。
 * back は active な予定だけを時刻順で返す。繰り返し・単発は混在するため、
 * 画面側で days_of_week / planned_on を見て振り分ける。
 */
export async function getSchedules(): Promise<FetchResult<Schedule[]>> {
  return fetchV2<Schedule[]>(BASE_PATH, "getSchedules");
}

/**
 * 予定を新規作成する（POST /api/v2/schedules）。
 * 自主練スケジュールは無料プランでも件数上限が無いため、403 を「無料枠の超過」として扱わない。
 * notification_message は Pro（custom_notification_messages）以外では back 側で捨てられる。
 */
export async function createSchedule(
  input: ScheduleInput,
): Promise<MutationResult<Schedule>> {
  return mutateV2<Schedule>(BASE_PATH, {
    method: "POST",
    body: { schedule: input },
    action: "createSchedule",
    fallbackMessage: "予定の作成に失敗しました",
  });
}

/**
 * 予定を更新する（PATCH /api/v2/schedules/:id）。
 * menus を渡すと紐付けメニューを全置換し、省略すると既存のまま維持される。
 */
export async function updateSchedule(
  id: number,
  input: ScheduleInput,
): Promise<MutationResult<Schedule>> {
  return mutateV2<Schedule>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { schedule: input },
    action: "updateSchedule",
    fallbackMessage: "予定の更新に失敗しました",
  });
}

/**
 * 週の単発予定を翌週へ一括コピーする（POST /api/v2/schedules/week_copy）。
 *
 * Pro 限定（entitlement: schedule_copy_next_week）。無料プランでは 403 が返るため、
 * 呼び出し側は reason:"forbidden" を「無料枠の超過」ではなく Pro 限定機能の案内へ倒す。
 *
 * コピー対象はその週（week_start 〜 +6日）の単発予定だけで、毎週の繰り返し予定は含まれない。
 * コピー元が 0 件でも、コピー先に同じ予定が既にあってスキップされた場合も 201 + 空配列が返る
 * （back は冪等になるよう同一内容の予定を作り直さない）。「成功したのに何も増えていない」
 * ケースがあるため、data.length を見て案内を出し分けること。
 *
 * @param weekStart コピー元の週の開始日（YYYY-MM-DD、月曜）
 * @returns 実際に作成された予定の配列（0 件なら空配列）
 */
export async function copyScheduleWeekToNext(
  weekStart: string,
): Promise<MutationResult<Schedule[]>> {
  return mutateV2<Schedule[]>(`${BASE_PATH}/week_copy`, {
    method: "POST",
    body: { week_start: weekStart },
    action: "copyScheduleWeekToNext",
    fallbackMessage: "来週へのコピーに失敗しました",
  });
}

/**
 * 予定を削除する（DELETE /api/v2/schedules/:id）。
 * 予定に紐づいた練習ログは実績として残り、schedule_id だけが外れる。
 */
export async function deleteSchedule(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteSchedule",
    fallbackMessage: "予定の削除に失敗しました",
  });
}
