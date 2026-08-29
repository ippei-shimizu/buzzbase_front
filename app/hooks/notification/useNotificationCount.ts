import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export const NOTIFICATION_COUNT_KEY = "/api/v1/notifications/count";

export function useNotificationCount() {
  const { data, error } = useSWR(NOTIFICATION_COUNT_KEY, fetcher);

  return {
    notificationCount: data,
    isLoading: !error && !data,
    isError: error,
  };
}
