import { AxiosError } from "axios";

export const RATE_LIMIT_FALLBACK_MESSAGE =
  "試行回数が上限に達しました。しばらく時間をおいてからお試しください";

type RateLimitResponse = {
  error?: string;
  message?: string;
};

/**
 * バックエンドの rack-attack によるレート制限エラーか判定する。
 * ステータスと安定コードの両方を見る（他の 429 と取り違えないため）。
 */
export const isRateLimitError = (error: unknown): boolean => {
  if (!(error instanceof AxiosError)) return false;
  if (error.response?.status !== 429) return false;

  const data = error.response.data as RateLimitResponse | undefined;
  return data?.error === "rate_limit_exceeded";
};

/**
 * レート制限エラーの表示文言を返す。文言はバックエンドに一元化しているため message を優先する。
 */
export const rateLimitErrorMessage = (error: unknown): string => {
  if (!(error instanceof AxiosError)) return RATE_LIMIT_FALLBACK_MESSAGE;

  const data = error.response?.data as RateLimitResponse | undefined;
  return data?.message || RATE_LIMIT_FALLBACK_MESSAGE;
};
