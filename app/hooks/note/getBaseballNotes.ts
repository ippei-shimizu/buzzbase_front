import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useBaseballNotes() {
  const { data, error } = useSWR("/api/v1/baseball_notes", fetcher);
  return {
    notes: data,
    isLoading: !error && !data,
    isError: error,
  };
}
