import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useAllUserGameResults() {
  const { data, error } = useSWR(
    "/api/v2/game_results/all",
    fetcher,
  );
  return {
    allUserGameResults: data,
    isLoading: !error && !data,
    isError: error,
  };
}
