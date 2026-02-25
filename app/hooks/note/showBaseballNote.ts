import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export default function useBaseballNote(id: number) {
  const { data, error } = useSWR(`/api/v1/baseball_notes/${id}`, fetcher);
  return {
    note: data,
    isLoading: !error && !data,
    isError: error,
  };
}
