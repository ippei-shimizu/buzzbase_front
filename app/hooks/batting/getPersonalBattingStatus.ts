"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalBattingStatus(
  userId: number,
  seasonId?: number,
) {
  const params = new URLSearchParams({ user_id: String(userId) });
  if (seasonId) {
    params.append("season_id", String(seasonId));
  }
  const { data, error } = useSWR(
    userId
      ? `/api/v1/batting_averages/personal_batting_stats?${params.toString()}`
      : null,
    fetcher,
  );
  return {
    personalBattingStatus: data,
    isLoadingBS: !error && !data,
    isError: error,
  };
}
