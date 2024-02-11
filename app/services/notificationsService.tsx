import axiosInstance from "@app/utils/axiosInstance";

export const getNotifications = async (user_id: number) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/notifications?user_id=${user_id}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteNotification = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
