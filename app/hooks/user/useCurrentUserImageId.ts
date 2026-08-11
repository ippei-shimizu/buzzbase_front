import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

// 未ログイン時はAPIが常に空データを返すだけなので、キーをnullにしてリクエスト自体を送らない
export default function useCurrentUserImageId(isLoggedIn: boolean | undefined) {
  const { data, error } = useSWR(
    isLoggedIn ? "/api/v1/users/show_current_user_details" : null,
    fetcher,
  );
  return {
    currentUserData: data,
    isLoadingCurrentUserData: isLoggedIn ? !error && !data : false,
    isErrorCurrentUserId: error,
  };
}
