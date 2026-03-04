import type { SeasonData } from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getSeasons = async (userId?: number) => {
  try {
    const params = userId ? `?user_id=${userId}` : "";
    const response = await axiosInstance.get(`/api/v1/seasons${params}`);
    return response.data as SeasonData[];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createSeason = async (name: string) => {
  try {
    const response = await axiosInstance.post("/api/v1/seasons", {
      season: { name },
    });
    return response.data as SeasonData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateSeason = async (id: number, name: string) => {
  try {
    const response = await axiosInstance.put(`/api/v1/seasons/${id}`, {
      season: { name },
    });
    return response.data as SeasonData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteSeason = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/seasons/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
