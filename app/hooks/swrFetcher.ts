import axiosInstance from "@app/utils/axiosInstance";

// タイムアウトを設定しないと、バックエンドの応答が返らない場合にリクエストが
// 永久にpending状態となり、SWRのdata/errorが確定せずローディング表示が固まり続ける
const SWR_FETCH_TIMEOUT_MS = 10000;

export const fetcher = (url: string) =>
  axiosInstance
    .get(url, { timeout: SWR_FETCH_TIMEOUT_MS })
    .then((res) => res.data);
