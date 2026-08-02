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
 * 対象ユーザーの試合に紐づく大会だけを取得する（絞り込みチップの候補用）。
 * 全大会を返す `getTournaments` と違い、選んでも0件になる大会が候補に出ない。
 *
 * @param userId 対象ユーザー（省略時はログインユーザー）
 */
export const getUserTournaments = async (
  userId?: number,
): Promise<TournamentData[]> => {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const response = await axiosInstance.get(
      `/api/v1/tournaments/user_tournaments${query}`,
    );
    return response.data;
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
