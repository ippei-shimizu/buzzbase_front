"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalPitchingResultStats(userId: number) {
  const { data, error } = useSWR(
    userId
      ? `/api/v1/pitching_results/personal_pitching_stats?user_id=${userId}`
      : null,
    fetcher,
  );
  return {
    personalPitchingStatus: data,
    isLoadingPS: !error && !data,
    isError: error,
  };
}
