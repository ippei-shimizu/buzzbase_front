import type { FilterValues } from "@app/components/filter/filterTypes";
import type { GameResultData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getGameResults = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/game_results/game_associated_data_index",
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllUserGameResults = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/game_results/all_game_associated_data",
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGameResultsUserId = async (user_id: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/game_results/game_associated_data_index_user_id?user_id=${user_id}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createGameResult = async () => {
  try {
    const response = await axiosInstance.post("/api/v1/game_results");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateGameResult = async (
  id: number,
  gameResultData: GameResultData,
) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/game_results/${id}`,
      gameResultData,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateBattingAverageId = async (
  id: number,
  data: { game_result: { batting_average_id: number } },
) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/game_results/${id}/update_batting_average_id`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updatePitchingResultId = async (
  id: number,
  data: { game_result: { pitching_result_id: number } },
) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/game_results/${id}/update_pitching_result_id`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFilterGameResults = async (
  year: string | number,
  matchType: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/game_results/filtered_game_associated_data?year=${year}&match_type=${matchType}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFilterGameResultsUserId = async (
  userId: number,
  year: string | number,
  matchType: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/game_results/filtered_game_associated_data_user_id?user_id=${userId}&year=${year}&match_type=${matchType}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ============================================================
// v2 API functions
// v1との違い: レスポンスに opponent_team_name, tournament_name,
// plate_appearances を含むため、フロントエンドでの追加APIリクエストが不要。
// これにより試合一覧の表示で ~3N+1 → 1-2 リクエストに削減される。
// ページネーション対応: { data: [...], pagination: { current_page, per_page, total_count, total_pages } }
// ============================================================

export type PaginationInfo = {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationInfo;
};

/**
 * 認証ユーザー自身の試合一覧を取得する（v2）
 */
export const getGameResultsV2 = async (
  page?: number,
  perPage?: number,
): Promise<PaginatedResponse<unknown>> => {
  try {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (perPage) params.set("per_page", String(perPage));
    const query = params.toString();
    const response = await axiosInstance.get(
      `/api/v2/game_results${query ? `?${query}` : ""}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 指定ユーザーの試合一覧を取得する（v2）
 */
export const getGameResultsUserIdV2 = async (
  userId: number,
  page?: number,
  perPage?: number,
): Promise<PaginatedResponse<unknown>> => {
  try {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (perPage) params.set("per_page", String(perPage));
    const query = params.toString();
    const response = await axiosInstance.get(
      `/api/v2/game_results/user/${userId}${query ? `?${query}` : ""}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 試合一覧の絞り込み・並び替え・ページング条件。
 * 未指定のキーはクエリに含めず、バックエンド側の「絞り込まない」既定に委ねる。
 */
export type GameResultsFilterParams = FilterValues & {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
};

function buildGameResultsQuery(params: GameResultsFilterParams): string {
  const query = new URLSearchParams();
  if (params.year) query.set("year", params.year);
  if (params.matchType) query.set("match_type", params.matchType);
  if (params.seasonId) query.set("season_id", params.seasonId);
  if (params.tournamentId) query.set("tournament_id", params.tournamentId);
  if (params.startMonth) query.set("start_month", params.startMonth);
  if (params.endMonth) query.set("end_month", params.endMonth);
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("per_page", String(params.perPage));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sort_by", params.sortBy);
  if (params.sortOrder) query.set("sort_order", params.sortOrder);
  return query.toString();
}

/**
 * 認証ユーザー自身の試合一覧を絞り込んで取得する（v2）
 */
export const getFilterGameResultsV2 = async (
  params: GameResultsFilterParams = {},
): Promise<PaginatedResponse<unknown>> => {
  try {
    const query = buildGameResultsQuery(params);
    const response = await axiosInstance.get(
      `/api/v2/game_results/filtered_index${query ? `?${query}` : ""}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 指定ユーザーの試合一覧を絞り込んで取得する（v2）
 */
export const getFilterGameResultsUserIdV2 = async (
  userId: number,
  params: GameResultsFilterParams = {},
): Promise<PaginatedResponse<unknown>> => {
  try {
    const query = buildGameResultsQuery(params);
    const response = await axiosInstance.get(
      `/api/v2/game_results/filtered_user/${userId}${query ? `?${query}` : ""}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * 全ユーザーの試合一覧を取得する（v2・タイムライン表示用）
 */
export const getAllUserGameResultsV2 = async (
  page?: number,
  perPage?: number,
): Promise<PaginatedResponse<unknown>> => {
  try {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (perPage) params.set("per_page", String(perPage));
    const query = params.toString();
    const response = await axiosInstance.get(
      `/api/v2/game_results/all${query ? `?${query}` : ""}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteGameResult = async (id: number | null) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/game_results/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
