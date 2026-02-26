import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function usePrefectures() {
  const { data, error } = useSWR("/api/v1/prefectures", fetcher);
  return {
    teamPrefectureName: data,
    isLoadingPrefecture: !error && !data,
    isErrorPrefecture: error,
  };
}
