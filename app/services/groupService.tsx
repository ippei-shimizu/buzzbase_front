import type { FilterValues } from "@app/components/filter/filterTypes";
import axiosInstance from "@app/utils/axiosInstance";

export const createGroup = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post("/api/v1/groups", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroups = async (userId: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/groups/?userId=${userId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupDetailUsers = async (groupId: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/groups/${groupId}/show_group_user`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * グループ詳細（メンバーの個人成績ランキング）を絞り込み条件付きで取得する。
 * シーズンはグループ横断で意味を持たないため、フィルタとしては受け取らない。
 *
 * @param id グループID
 * @param filters 年度 / 種別 / 大会 / 月範囲の絞り込み（未指定は絞り込まない）
 */
export const getGroupDetail = async (
  id: number,
  filters: Omit<FilterValues, "seasonId"> = {},
) => {
  try {
    const params = new URLSearchParams();
    if (filters.year) params.append("year", filters.year);
    if (filters.matchType) params.append("match_type", filters.matchType);
    if (filters.tournamentId)
      params.append("tournament_id", filters.tournamentId);
    if (filters.startMonth) params.append("start_month", filters.startMonth);
    if (filters.endMonth) params.append("end_month", filters.endMonth);
    const query = params.toString();
    const response = await axiosInstance.get(
      `/api/v1/groups/${id}${query ? `?${query}` : ""}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGroup = async (groupId: number, formData: FormData) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/groups/${groupId}`,
      formData,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateGroupInfo = async (groupId: number, formData: FormData) => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/groups/${groupId}/update_group_info`,
      formData,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createInviteMembers = async (
  groupId: number,
  formData: FormData,
) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/groups/${groupId}/invite_members`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteGroup = async (groupId: number) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/groups/${groupId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
