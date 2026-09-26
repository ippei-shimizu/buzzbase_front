import type { MyTeam, SearchedTeam, teamData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getTeamName = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/api/v1/teams/${id}/team_name`);
    return response.data.name;
  } catch {
    return "";
  }
};

/** GET /api/v1/teams の limit 上限（back の MAX_LIMIT と揃える）。 */
export const TEAM_SEARCH_MAX_LIMIT = 100;

/**
 * チーム名の部分一致でチームを検索する（名前・id 順）。
 * @param q 検索するチーム名
 * @param limit 取得件数。省略時は back の既定件数
 * @returns 一致したチーム（id / name / category_id / prefecture_id を含む）
 */
export const searchTeams = async (
  q: string,
  limit?: number,
): Promise<SearchedTeam[]> => {
  const response = await axiosInstance.get<SearchedTeam[]>("/api/v1/teams", {
    params: { q, limit },
  });
  return response.data;
};

/**
 * ユーザーの所属チームを、カテゴリー名・地域名まで解決済みの形で取得する。
 * @param userId ユーザーの公開 ID（`user_id`）
 * @returns 所属チーム。所属チームが無い・取得に失敗したときは null
 */
export const getMyTeam = async (userId: string): Promise<MyTeam | null> => {
  try {
    const response = await axiosInstance.get<Partial<MyTeam>>(
      `/api/v1/teams/${encodeURIComponent(userId)}/my_team`,
    );
    const { name, category_name, prefecture_name } = response.data;
    return name
      ? {
          name,
          category_name: category_name ?? null,
          prefecture_name: prefecture_name ?? null,
        }
      : null;
  } catch {
    return null;
  }
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
