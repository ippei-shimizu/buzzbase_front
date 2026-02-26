import type { GameResultData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getGameResults = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/game_results/game_associated_data_index",
    );
    return response.data;
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
    throw error;
  }
};

export const createGameResult = async () => {
  try {
    const response = await axiosInstance.post("/api/v1/game_results");
    return response.data;
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
    throw error;
  }
};

// ============================================================
// v2 API functions
// v1との違い: レスポンスに opponent_team_name, tournament_name,
// plate_appearances を含むため、フロントエンドでの追加APIリクエストが不要。
// これにより試合一覧の表示で ~3N+1 → 1-2 リクエストに削減される。
// ============================================================

/**
 * 認証ユーザー自身の試合一覧を取得する（v2）
 * @returns match_result（チーム名・大会名展開済み）、plate_appearances、batting_average、pitching_result を含む試合結果の配列
 */
export const getGameResultsV2 = async () => {
  try {
    const response = await axiosInstance.get("/api/v2/game_results");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * 指定ユーザーの試合一覧を取得する（v2）
 * @param userId - 対象ユーザーのID
 * @returns 対象ユーザーの試合結果の配列（関連データ展開済み）
 */
export const getGameResultsUserIdV2 = async (userId: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v2/game_results/user/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * 認証ユーザー自身の試合一覧を年度・試合種別でフィルタして取得する（v2）
 * @param year - フィルタ対象の年度（"通算"の場合フィルタなし）
 * @param matchType - フィルタ対象の試合種別（"全て"/"公式戦"/"オープン戦"）
 * @returns フィルタ済みの試合結果の配列（関連データ展開済み）
 */
export const getFilterGameResultsV2 = async (
  year: string | number,
  matchType: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/api/v2/game_results/filtered_index?year=${year}&match_type=${matchType}`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * 指定ユーザーの試合一覧を年度・試合種別でフィルタして取得する（v2）
 * @param userId - 対象ユーザーのID
 * @param year - フィルタ対象の年度（"通算"の場合フィルタなし）
 * @param matchType - フィルタ対象の試合種別（"全て"/"公式戦"/"オープン戦"）
 * @returns フィルタ済みの試合結果の配列（関連データ展開済み）
 */
export const getFilterGameResultsUserIdV2 = async (
  userId: number,
  year: string | number,
  matchType: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/api/v2/game_results/filtered_user/${userId}?year=${year}&match_type=${matchType}`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * 全ユーザーの試合一覧を取得する（v2・タイムライン表示用）
 * @returns ユーザー情報付きの全試合結果の配列（関連データ展開済み）
 */
export const getAllUserGameResultsV2 = async () => {
  try {
    const response = await axiosInstance.get("/api/v2/game_results/all");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteGameResult = async (id: number | null) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/game_results/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
