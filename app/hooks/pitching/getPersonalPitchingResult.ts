"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalPitchingResult(
  userId: number,
  seasonId?: number,
) {
  const params = new URLSearchParams({ user_id: String(userId) });
  if (seasonId) {
    params.append("season_id", String(seasonId));
  }
  const { data, error } = useSWR(
    userId
      ? `/api/v1/pitching_results/personal_pitching_result?${params.toString()}`
      : null,
    fetcher,
  );
  return {
    personalPitchingResults: data,
    isLoadingPR: !error && !data,
    isError: error,
  };
}
