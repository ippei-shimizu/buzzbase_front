"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalBattingStatus(
  userId: number,
  seasonId?: number,
  year?: string,
  matchType?: string,
  startMonth?: string,
  endMonth?: string,
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
  if (startMonth) {
    params.append("start_month", startMonth);
  }
  if (endMonth) {
    params.append("end_month", endMonth);
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
