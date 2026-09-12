"use server";

import type {
  CorrelationInsight,
  CorrelationInsightsResponse,
  InsightCombinationInput,
} from "@app/types/insight";
import {
  INSIGHT_COMBINATION_CREATE_FALLBACK,
  INSIGHT_COMBINATION_DELETE_FALLBACK,
} from "@app/constants/insight";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const INSIGHTS_PATH = "/api/v2/correlation_insights";
const COMBINATIONS_PATH = "/api/v2/insight_combinations";

/**
 * インサイトカード一覧を取得する（GET /api/v2/correlation_insights）。
 *
 * 「練習と成績のつながり」は Pro 限定機能で、entitlement が無いと back は 403 を返すため
 * status:"forbidden" は「無料ユーザー」を意味する（件数超過ではない）。
 * 取得失敗（error）と 0 件（ok + 空配列）は表示を変えるので丸めない。
 */
export async function getCorrelationInsights(): Promise<
  FetchResult<CorrelationInsight[]>
> {
  const result = await fetchV2<CorrelationInsightsResponse>(
    INSIGHTS_PATH,
    "getCorrelationInsights",
  );
  if (result.status !== "ok") return result;
  return { status: "ok", data: result.data.insights ?? [] };
}

/**
 * 自作の組み合わせを作成する（POST /api/v2/insight_combinations）。
 *
 * back は Pro 未加入を 403、20件上限・重複・バリデーション違反を 422 で返す。
 * 呼び出し側は reason:"forbidden" を Pro 訴求へ、reason:"error" を
 * フォーム内のエラー表示へ振り分けること（意味がまったく違う）。
 */
export async function createInsightCombination(
  input: InsightCombinationInput,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(COMBINATIONS_PATH, {
    method: "POST",
    body: { insight_combination: input },
    action: "createInsightCombination",
    fallbackMessage: INSIGHT_COMBINATION_CREATE_FALLBACK,
  });
}

/**
 * 自作の組み合わせを削除する（DELETE /api/v2/insight_combinations/:id）。
 * おすすめ（プリセット）は組み合わせレコードを持たないため、このAPIの対象にならない。
 */
export async function deleteInsightCombination(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${COMBINATIONS_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteInsightCombination",
    fallbackMessage: INSIGHT_COMBINATION_DELETE_FALLBACK,
  });
}
