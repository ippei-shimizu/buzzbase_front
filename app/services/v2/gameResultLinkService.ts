"use server";

import type { GameResultLinkOption } from "@app/types/gameResultLink";
import { type FetchResult, buildQuery, fetchV2 } from "./requests";

const BASE_PATH = "/api/v2/game_results";

/** 候補リストの取得件数。ピッカーは検索して絞り込む前提なので先頭ページだけを見る。 */
const SEARCH_PER_PAGE = 20;

/** back の V2::GameResultSerializer のうち、紐付け UI が参照する部分だけの形。 */
interface RawGameResult {
  game_result_id: number;
  match_result: {
    date_and_time: string | null;
    opponent_team_name: string | null;
  } | null;
}

interface PaginatedGameResults {
  data: RawGameResult[];
}

function toOption(raw: RawGameResult): GameResultLinkOption {
  return {
    game_result_id: raw.game_result_id,
    // date_and_time は ISO 8601 で返るため、日付部分だけを取り出す。
    date: raw.match_result?.date_and_time?.slice(0, 10) ?? "",
    opponent_team_name: raw.match_result?.opponent_team_name ?? "",
  };
}

/**
 * 対戦相手名で試合記録を検索する（GET /api/v2/game_results/filtered_index）。
 * 検索は back の `search_by_opponent`（teams.name の部分一致）が担うため、
 * 全件を取得してクライアントで絞り込むことはしない。
 *
 * @param search 対戦相手名の部分一致キーワード。空なら直近の試合を新しい順で返す。
 */
export async function searchGameResultOptions(
  search?: string,
): Promise<FetchResult<GameResultLinkOption[]>> {
  const query = buildQuery({ search, per_page: SEARCH_PER_PAGE });
  const result = await fetchV2<PaginatedGameResults>(
    `${BASE_PATH}/filtered_index${query}`,
    "searchGameResultOptions",
  );
  if (result.status !== "ok") return result;
  return { status: "ok", data: result.data.data.map(toOption) };
}

/**
 * 試合記録を1件取得する（GET /api/v2/game_results/:id）。
 * ノート詳細で紐付け先カードを描くために使う。
 */
export async function getGameResultOption(
  id: number,
): Promise<FetchResult<GameResultLinkOption>> {
  const result = await fetchV2<RawGameResult>(
    `${BASE_PATH}/${id}`,
    "getGameResultOption",
  );
  if (result.status !== "ok") return result;
  return { status: "ok", data: toOption(result.data) };
}
