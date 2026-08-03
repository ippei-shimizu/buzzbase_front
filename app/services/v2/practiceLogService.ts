"use server";

import type { PracticeLog, PracticeLogInput } from "@app/types/practice";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  buildQuery,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/practice_logs";

interface GetPracticeLogsParams {
  /** YYYY-MM-DD。この日以降の記録に絞る。 */
  from?: string;
  /** YYYY-MM-DD。この日以前の記録に絞る。 */
  to?: string;
}

/**
 * 練習ログ一覧を取得する（GET /api/v2/practice_logs）。
 * 期間を指定しなければ全期間を新しい順で返す（量記録の閲覧は無料でも制限なし）。
 */
export async function getPracticeLogs(
  params: GetPracticeLogsParams = {},
): Promise<FetchResult<PracticeLog[]>> {
  const query = buildQuery({ from: params.from, to: params.to });
  return fetchV2<PracticeLog[]>(`${BASE_PATH}${query}`, "getPracticeLogs");
}

/**
 * 練習ログを単票で作成する（POST /api/v2/practice_logs）。
 * back 側でメニュー名・単位ラベルをスナップショットし、当日の日次セッションへ自動で束ねる。
 */
export async function createPracticeLog(
  input: PracticeLogInput,
): Promise<MutationResult<PracticeLog>> {
  return mutateV2<PracticeLog>(BASE_PATH, {
    method: "POST",
    body: { practice_log: input },
    action: "createPracticeLog",
    fallbackMessage: "練習記録の保存に失敗しました",
  });
}

/** 練習ログを削除する（DELETE /api/v2/practice_logs/:id）。 */
export async function deletePracticeLog(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deletePracticeLog",
    fallbackMessage: "練習記録の削除に失敗しました",
  });
}
