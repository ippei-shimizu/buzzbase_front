"use client";
import { fetcher } from "@app/hooks/swrFetcher";
import useSWR from "swr";

export function usePersonalPitchingResult(userId: number) {
  const { data, error } = useSWR(
    userId
      ? `/api/v1/pitching_results/personal_pitching_result?user_id=${userId}`
      : null,
    fetcher,
  );
  return {
    personalPitchingResults: data,
    isLoadingPR: !error && !data,
    isError: error,
  };
}
