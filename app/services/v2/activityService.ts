"use server";

import type { ActivityHeatmap } from "@app/types/activity";
import { type FetchResult, buildQuery, fetchV2 } from "./requests";

const BASE_PATH = "/api/v2/activity_logs";

/**
 * 草グラフ用の日別活動ログと Streak をまとめて取得する（GET /api/v2/activity_logs）。
 *
 * 無料プランの from は back が「今日から直近30日」へクランプする。
 * 範囲外を要求しても 403 ではなく 200 + クランプ後のデータが返るため、
 * 「返ってこない日 = 記録が無い日」と解釈してはいけない。
 * レスポンスの from / to がクランプ後の実際の期間なので、描画範囲はそちらを使う。
 *
 * @param from 期間開始日（YYYY-MM-DD）。省略すると back が今日から 365 日前にする。
 * @param to 期間終了日（YYYY-MM-DD）。省略すると back が今日にする。
 */
export async function getActivityHeatmap(
  from?: string,
  to?: string,
): Promise<FetchResult<ActivityHeatmap>> {
  return fetchV2<ActivityHeatmap>(
    `${BASE_PATH}${buildQuery({ from, to })}`,
    "getActivityHeatmap",
  );
}
