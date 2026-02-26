import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useCurrentUserImageId() {
  const { data, error } = useSWR(
    "/api/v1/users/show_current_user_details",
    fetcher,
  );
  return {
    currentUserData: data,
    isLoadingCurrentUserData: !error && !data,
    isErrorCurrentUserId: error,
  };
}
