import type {
  AcceptInviteLinkResponse,
  InviteLinkInfo,
  InviteLinkResponse,
} from "@app/interface";
import axiosInstance from "@app/utils/axiosInstance";

export const getOrCreateInviteLink = async (
  groupId: number,
): Promise<InviteLinkResponse> => {
  const response = await axiosInstance.post<InviteLinkResponse>(
    `/api/v1/groups/${groupId}/invite_link`,
  );
  return response.data;
};

export const getInviteLinkInfo = async (
  code: string,
): Promise<InviteLinkInfo> => {
  const response = await axiosInstance.get<InviteLinkInfo>(
    `/api/v1/invite_links/${code}`,
  );
  return response.data;
};

export const acceptInviteLink = async (
  code: string,
): Promise<AcceptInviteLinkResponse> => {
  const response = await axiosInstance.post<AcceptInviteLinkResponse>(
    `/api/v1/invite_links/${code}/accept`,
  );
  return response.data;
};
