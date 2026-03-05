"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalPitchingResultStats(
  userId: number,
  seasonId?: number,
  year?: string,
  matchType?: string,
) {
  const params = new URLSearchParams({ user_id: String(userId) });
  if (seasonId) {
    params.append("season_id", String(seasonId));
  }
  if (year) {
    params.append("year", year);
  }
  if (matchType) {
    params.append("match_type", matchType);
  }
  const { data, error } = useSWR(
    userId
      ? `/api/v1/pitching_results/personal_pitching_stats?${params.toString()}`
      : null,
    fetcher,
  );
  return {
    personalPitchingStatus: data,
    isLoadingPS: !error && !data,
    isError: error,
  };
}
