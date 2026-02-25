import axiosInstance from "@app/utils/axiosInstance";

export const acceptGroupInvitation = async (groupId: number) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/group_invitations/${groupId}/accept_invitation`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const declinedGroupInvitation = async (groupId: number) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/group_invitations/${groupId}/declined_invitation`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
