"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalBattingAverage(
  userId: number,
  seasonId?: number,
) {
  const params = new URLSearchParams({ user_id: String(userId) });
  if (seasonId) {
    params.append("season_id", String(seasonId));
  }
  const { data, error } = useSWR(
    userId
      ? `/api/v1/batting_averages/personal_batting_average?${params.toString()}`
      : null,
    fetcher,
  );
  return {
    personalBattingAverages: data,
    isLoadingBA: !error && !data,
    isError: error,
  };
}
