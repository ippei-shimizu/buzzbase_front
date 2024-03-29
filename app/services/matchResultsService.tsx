import axiosInstance from "@app/utils/axiosInstance";

export const getMatchResults = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/match_results");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getMatchResultsUserId = async (userId: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/match_index_user_id?user_id=${userId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createMatchResults = async (
  matchResultsData: MatchResultsData
) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/match_results",
      matchResultsData
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getMatchResult = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/api/v1/match_results/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateMatchResult = async (
  id: number,
  matchResultsData: MatchResultsData
) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/match_results/${id}`,
      matchResultsData
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteMatchResult = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/match_results/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const checkExistingMatchResults = async (
  gameResultId: number | null,
  userId: number | null
) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/existing_search?game_result_id=${gameResultId}&user_id=${userId}`
    );
    return response.data;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

export const getCurrentMatchResult = async (gameResultId: number | null) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/current_game_result_search?game_result_id=${gameResultId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserMatchResult = async (gameResultId: number | null) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/user_game_result_search?game_result_id=${gameResultId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
