import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useFollowersUser(id: number | undefined) {
  const { data, error } = useSWR(
    id ? `/api/v1/users/${id}/followers_users` : null,
    fetcher,
  );
  return {
    followers: data,
    isLoadingFollowers: !error && !data,
    isErrorFollowing: error,
  };
}
