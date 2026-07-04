import type { TournamentData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getTournamentName = async (id: number | null) => {
  try {
    const response = await axiosInstance.get(`/api/v1/tournaments/${id}`);
    return response.data.name;
  } catch {
    return "";
  }
};

export const getTournaments = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/tournaments");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * ユーザーが記録した大会のみを返す（フィルタ候補用）。
 * userId 省略時は current_user、指定時はそのユーザーの大会。取得失敗時は空配列。
 */
export const getUserTournaments = async (
  userId?: number,
): Promise<TournamentData[]> => {
  try {
    const url = userId
      ? `/api/v1/tournaments/user_tournaments?user_id=${userId}`
      : "/api/v1/tournaments/user_tournaments";
    const response = await axiosInstance.get(url);
    return response.data as TournamentData[];
  } catch {
    return [];
  }
};

export const createTournament = async ({ name }: { name: string }) => {
  try {
    const response = await axiosInstance.post("/api/v1/tournaments", {
      tournament: { name },
    });
    return response.data as TournamentData;
  } catch (error) {
    throw error;
  }
};

export const updateTournament = async (id: number, name: string) => {
  try {
    const response = await axiosInstance.put(`/api/v1/tournaments/${id}`, {
      tournament: {
        name,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
