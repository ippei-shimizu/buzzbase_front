import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

/**
 * ヘッダーに出す現在ユーザーのプロフィール画像を取得する。
 *
 * 未ログイン時はAPIが常に空データを返すだけなので、キーをnullにしてリクエスト自体を送らない。
 *
 * @param isLoggedIn 認証判定の結果。判定中を表す undefined でも取得しない
 * @returns isLoadingCurrentUserData は「このフックが取得中か」だけを表し、
 *   認証判定中（isLoggedIn が undefined）は false になる。呼び出し側で
 *   認証判定中のローディングも見せたい場合は useAuthContext の loading と併せて判定する
 */
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
