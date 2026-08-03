"use server";

import type { Goal, GoalInput, GoalUpdateInput } from "@app/types/goal";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/goals";

/**
 * 進行中（未確定）の目標一覧を取得する（GET /api/v2/goals）。
 * back は is_finalized = false のものだけを期限の昇順で返す。
 */
export async function getGoals(): Promise<FetchResult<Goal[]>> {
  return fetchV2<Goal[]>(BASE_PATH, "getGoals");
}

/**
 * 確定済み（期限到来後に FinalizeGoalsJob が確定させた）目標の履歴を取得する
 * （GET /api/v2/goals/history）。達成・未達タブの表示に使う。
 */
export async function getGoalHistory(): Promise<FetchResult<Goal[]>> {
  return fetchV2<Goal[]>(`${BASE_PATH}/history`, "getGoalHistory");
}

/**
 * 目標を新規作成する（POST /api/v2/goals）。
 *
 * back は Pro 限定（シーズン / 大会 / カスタム期間 / 自由指標）と
 * 無料枠超過（個人の期間目標が合算 2 件）をどちらも 403 で返すため、
 * reason:"forbidden" の文言は back のメッセージをそのまま使って取り違えを防ぐ。
 */
export async function createGoal(
  input: GoalInput,
): Promise<MutationResult<Goal>> {
  return mutateV2<Goal>(BASE_PATH, {
    method: "POST",
    body: { goal: input },
    action: "createGoal",
    fallbackMessage: "目標の作成に失敗しました",
  });
}

/**
 * 目標を更新する（PATCH /api/v2/goals/:id）。
 *
 * back が許可するのは title / month_start / deadline / target_value /
 * custom_metric_label / custom_unit / manual_current_value のみ。
 * 変更不可の属性は GoalUpdateInput が持たないため、送信されることはない。
 */
export async function updateGoal(
  id: number,
  input: GoalUpdateInput,
): Promise<MutationResult<Goal>> {
  return mutateV2<Goal>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { goal: input },
    action: "updateGoal",
    fallbackMessage: "目標の更新に失敗しました",
  });
}

/** 目標を削除する（DELETE /api/v2/goals/:id）。自分の目標のみ削除可。 */
export async function deleteGoal(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteGoal",
    fallbackMessage: "目標の削除に失敗しました",
  });
}

/**
 * 定性目標を達成にする（POST /api/v2/goals/:id/achievement）。
 * 数値目標・自由指標は指標から自動判定するため back が 422 を返す。UI 側でも操作を出さない。
 */
export async function achieveGoal(id: number): Promise<MutationResult<Goal>> {
  return mutateV2<Goal>(`${BASE_PATH}/${id}/achievement`, {
    method: "POST",
    action: "achieveGoal",
    fallbackMessage: "達成の記録に失敗しました",
  });
}

/** 定性目標の達成を取り消す（DELETE /api/v2/goals/:id/achievement）。 */
export async function unachieveGoal(id: number): Promise<MutationResult<Goal>> {
  return mutateV2<Goal>(`${BASE_PATH}/${id}/achievement`, {
    method: "DELETE",
    action: "unachieveGoal",
    fallbackMessage: "達成の取り消しに失敗しました",
  });
}
