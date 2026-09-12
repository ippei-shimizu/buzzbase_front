"use server";

import type { PeriodicReview } from "@app/types/periodicReview";
import {
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/periodic_reviews";

/**
 * 週次 / 月次レポート一覧を取得する（GET /api/v2/periodic_reviews）。
 * 期間の新しい順で返る。
 *
 * back は advanced_periodic_review を持たないユーザーへは 403 ではなく 200 + 空配列を返すため、
 * 空配列だけでは「Pro 未加入」と「Pro だがまだ生成されていない」を区別できない。
 * 呼び出し側で entitlement と組み合わせて出し分けること。
 */
export async function getPeriodicReviews(): Promise<
  FetchResult<PeriodicReview[]>
> {
  return fetchV2<PeriodicReview[]>(BASE_PATH, "getPeriodicReviews");
}

/**
 * レポート1件を既読にする（PATCH /api/v2/periodic_reviews/:id）。
 * 無料ユーザーはレコードごと隠されるため 404（reason:"error"）が返る。
 */
export async function markPeriodicReviewRead(
  id: number,
): Promise<MutationResult<PeriodicReview>> {
  return mutateV2<PeriodicReview>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    // 更新する属性は無い（read: true を立てるだけ）が、Content-Type: application/json に対して
    // 本文を空にすると Rails 側でパースエラーになり得るため空オブジェクトを送る。
    body: {},
    action: "markPeriodicReviewRead",
    fallbackMessage: "既読にできませんでした",
  });
}
