"use server";

import type {
  PracticeSession,
  PracticeSessionInput,
} from "@app/types/practice";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  buildQuery,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/practice_sessions";

interface GetPracticeSessionsParams {
  /** YYYY-MM-DD。この日以降のセッションに絞る。 */
  from?: string;
  /** YYYY-MM-DD。この日以前のセッションに絞る。 */
  to?: string;
  /** 指定した課題テーマに紐づくセッションだけに絞る。 */
  improvement_theme_id?: number;
}

/**
 * 日次セッション一覧を取得する（GET /api/v2/practice_sessions）。
 * logged_on の新しい順で返り、各セッションにその日のコンディションが含まれる。
 */
export async function getPracticeSessions(
  params: GetPracticeSessionsParams = {},
): Promise<FetchResult<PracticeSession[]>> {
  const query = buildQuery({
    from: params.from,
    to: params.to,
    improvement_theme_id: params.improvement_theme_id,
  });
  return fetchV2<PracticeSession[]>(
    `${BASE_PATH}${query}`,
    "getPracticeSessions",
  );
}

/** 日次セッションを1件取得する（GET /api/v2/practice_sessions/:id）。他ユーザーのセッションは 404。 */
export async function getPracticeSession(
  id: number,
): Promise<FetchResult<PracticeSession>> {
  return fetchV2<PracticeSession>(`${BASE_PATH}/${id}`, "getPracticeSession");
}

/**
 * 指定日の日次セッションを取得する（GET /api/v2/practice_sessions/by_date）。
 * その日の記録がまだ無い場合、back は 200 + null を返すため data は null になりうる。
 */
export async function getPracticeSessionByDate(
  date: string,
): Promise<FetchResult<PracticeSession | null>> {
  return fetchV2<PracticeSession | null>(
    `${BASE_PATH}/by_date${buildQuery({ date })}`,
    "getPracticeSessionByDate",
  );
}

/**
 * 日次セッションを保存する（POST /api/v2/practice_sessions）。
 * 同じ logged_on への再送は新規作成ではなく upsert（メニュー項目は差分同期）になる。
 *
 * コンディション付きの保存と、2件以上の課題紐付けは Pro 限定のため 403 になりうる。
 * その場合は更新全体がロールバックされる。
 */
export async function upsertPracticeSession(
  input: PracticeSessionInput,
): Promise<MutationResult<PracticeSession>> {
  return mutateV2<PracticeSession>(BASE_PATH, {
    method: "POST",
    body: { practice_session: input },
    action: "upsertPracticeSession",
    fallbackMessage: "練習記録の保存に失敗しました",
  });
}

/**
 * 日次セッションを削除する（DELETE /api/v2/practice_sessions/:id）。
 * 配下の練習ログも一緒に削除される。
 */
export async function deletePracticeSession(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deletePracticeSession",
    fallbackMessage: "練習記録の削除に失敗しました",
  });
}
