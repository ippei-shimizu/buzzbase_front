import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useBaseballCategory() {
  const { data, error } = useSWR("/api/v1/baseball_categories", fetcher);
  return {
    teamCategoryName: data,
    isLoadingBaseballCat: !error && !data,
    isErrorBaseballCat: error,
  };
}
