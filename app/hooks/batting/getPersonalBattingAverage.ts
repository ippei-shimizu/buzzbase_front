"use client";
import useSWR from "swr";
import { fetcher } from "@app/hooks/swrFetcher";

export function usePersonalBattingAverage(userId: number) {
  const { data, error } = useSWR(
    userId
      ? `/api/v1/batting_averages/personal_batting_average?user_id=${userId}`
      : null,
    fetcher,
  );
  return {
    personalBattingAverages: data,
    isLoadingBA: !error && !data,
    isError: error,
  };
}
