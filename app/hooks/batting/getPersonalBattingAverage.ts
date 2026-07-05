"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalBattingAverage(
  userId: number,
  seasonId?: number,
  year?: string,
  matchType?: string,
  startMonth?: string,
  endMonth?: string,
  tournamentId?: number,
) {
  const params = new URLSearchParams({ user_id: String(userId) });
  if (seasonId) {
    params.append("season_id", String(seasonId));
  }
  if (tournamentId) {
    params.append("tournament_id", String(tournamentId));
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
