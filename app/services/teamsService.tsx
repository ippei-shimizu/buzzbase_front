import type { Team, teamData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getTeamName = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/api/v1/teams/${id}/team_name`);
    return response.data.name;
  } catch {
    return "";
  }
};

export const getTeams = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/teams");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * チーム名の部分一致検索。teams は全ユーザー共有で単調増加するマスタのため、
 * サジェストでは全件取得の `getTeams` を使わずこちらを使う。
 *
 * @param query 検索語（前後の空白は除いて送る）
 * @param limit 取得件数（back 側の上限は 100）
 * @returns 名前順のチーム一覧
 */
export const searchTeams = async (
  query: string,
  limit: number = 20,
): Promise<Team[]> => {
  const response = await axiosInstance.get<Team[]>("/api/v1/teams", {
    params: { q: query.trim(), limit },
  });
  return response.data;
};

export const createOrUpdateTeam = async (teamData: teamData) => {
  try {
    const response = await axiosInstance.post("/api/v1/teams", teamData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateTeam = async (
  id: number,
  teamData: {
    team: {
      name: string;
      category_id: number | undefined;
      prefecture_id: number | undefined;
    };
  },
) => {
  try {
    const response = await axiosInstance.put(`/api/v1/teams/${id}`, teamData);
    return response;
  } catch (error) {
    throw error;
  }
};
