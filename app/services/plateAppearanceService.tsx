import axiosInstance from "@app/utils/axiosInstance";

export const getPlateAppearances = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/plate_appearances");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createPlateAppearance = async () => {
  try {
    const response = await axiosInstance.post("/api/v1/plate_appearances");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updatePlateAppearance = async () => {
  try {
    const response = await axiosInstance.put(`/api/v1/plate_appearances/:id`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
