import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useAllUserGameResults() {
  const { data, error } = useSWR(
    "/api/v1/game_results/all_game_associated_data",
    fetcher,
  );
  return {
    allUserGameResults: data,
    isLoading: !error && !data,
    isError: error,
  };
}
