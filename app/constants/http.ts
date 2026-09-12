// タイムアウトを設定しないと、バックエンドの応答が返らない場合にリクエストが
// 永久にpending状態となり、ローディング表示が固まり続ける。
export const API_REQUEST_TIMEOUT_MS = 10000;
