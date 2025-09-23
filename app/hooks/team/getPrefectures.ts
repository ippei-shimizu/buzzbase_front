import { fetcher } from "@app/hooks/swrFetcher";
import useSWR from "swr";

export default function usePrefectures() {
  const { data, error } = useSWR("/api/v1/prefectures", fetcher);
  return {
    teamPrefectureName: data,
    isLoadingPrefecture: !error && !data,
    isErrorPrefecture: error,
  };
}
