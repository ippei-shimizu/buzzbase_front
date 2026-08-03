"use server";

import type { ActivityHeatmap, ShadowSwingStats } from "@app/types/activity";
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

/**
 * 素振りの累計本数を取得する（GET /api/v2/shadow_swing_sessions/stats）。
 *
 * 素振りカウンター本体はまだ front に無く、この累計は草セクションの節目表示だけが使う。
 * 取得できなくても草グラフ・Streak は成立するので、呼び出し側は失敗を握りつぶしてよい。
 */
export async function getShadowSwingStats(): Promise<
  FetchResult<ShadowSwingStats>
> {
  return fetchV2<ShadowSwingStats>(
    "/api/v2/shadow_swing_sessions/stats",
    "getShadowSwingStats",
  );
}
