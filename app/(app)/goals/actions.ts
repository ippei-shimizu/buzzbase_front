"use server";

import type { SeasonData, TournamentData } from "@app/interface";
import { type FetchResult, fetchV2 } from "@app/services/v2/requests";

/**
 * 目標フォームのシーズン候補を取得する。
 *
 * シーズン・大会には v2 エンドポイントがまだ無いため v1 を叩く。
 * fetchV2 は「認証ヘッダー付き GET + 403 の判別」を担うだけなので、パスの API バージョンには依存しない。
 */
export async function getGoalSeasonOptions(): Promise<
  FetchResult<SeasonData[]>
> {
  return fetchV2<SeasonData[]>("/api/v1/seasons", "getGoalSeasonOptions");
}

/**
 * 目標フォームの大会候補を取得する。
 *
 * 全大会ではなく自分の試合に紐づく大会だけを返すエンドポイントを使う。
 * 出場していない大会を目標に選んでも集計対象の試合が無く、進捗が常に 0 になってしまうため。
 */
export async function getGoalTournamentOptions(): Promise<
  FetchResult<TournamentData[]>
> {
  return fetchV2<TournamentData[]>(
    "/api/v1/tournaments/user_tournaments",
    "getGoalTournamentOptions",
  );
}
