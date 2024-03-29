import { fetcher } from "@app/hooks/swrFetcher";
import useSWR from "swr";

export default function getAllUserGameResults() {
  const { data, error } = useSWR(
    "/api/v1/game_results/all_game_associated_data",
    fetcher
  );
  return {
    allUserGameResults: data,
    isLoading: !error && !data,
    isError: error,
  };
}
