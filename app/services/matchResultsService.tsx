import type { MatchResultsData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getMatchResults = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/match_results");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMatchResultsUserId = async (userId: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/match_index_user_id?user_id=${userId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMatchResults = async (
  matchResultsData: MatchResultsData,
) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/match_results",
      matchResultsData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMatchResult = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/api/v1/match_results/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMatchResult = async (
  id: number,
  matchResultsData: MatchResultsData,
) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/match_results/${id}`,
      matchResultsData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMatchResult = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/match_results/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkExistingMatchResults = async (
  gameResultId: number | null,
  userId: number | null,
) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/existing_search?game_result_id=${gameResultId}&user_id=${userId}`,
    );
    return response.data;
  } catch {
    return null;
  }
};

export const getCurrentMatchResult = async (gameResultId: number | null) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/current_game_result_search?game_result_id=${gameResultId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserMatchResult = async (gameResultId: number | null) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/user_game_result_search?game_result_id=${gameResultId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 試合作成フォームの初期値を取得する。直近試合をもとに
 * inning_format（イニング制: 7 or 9。履歴なしは 9）、
 * batting_order（直近試合の打順。履歴なしは null）、
 * defensive_position（プロフィール最優先 → 直近試合 → null）が返る。
 */
export const getMatchResultFormDefaults = async (): Promise<{
  inning_format: number;
  batting_order: string | null;
  defensive_position: string | null;
}> => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/match_results/form_defaults",
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
