"use server";

import type {
  BattingStats,
  PitchingStats,
} from "@app/interface/dashboardStats";
import { cookies } from "next/headers";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";

export interface RecentGameResult {
  id: number;
  date: string;
  opponent_team_name: string | null;
  my_team_score: number;
  opponent_team_score: number;
  match_type: string;
  batting_average: {
    hit: number;
    at_bats: number;
    home_run: number;
    runs_batted_in: number;
  } | null;
  pitching_result: {
    innings_pitched: number;
    run_allowed: number;
    earned_run: number;
    strikeouts: number;
  } | null;
}

// 型は v2 ダッシュボード成績 API の共通定義（マイページ成績タブと共有）を再エクスポートする。
export type {
  BattingStats,
  PitchingStats,
} from "@app/interface/dashboardStats";

export interface RankingEntry {
  stat_type: string;
  label: string;
  current_rank: number | null;
  previous_rank: number | null;
  change: number | null;
  value: number | null;
}

export interface GroupRanking {
  group_id: number;
  group_name: string;
  group_icon: string | null;
  total_members: number;
  batting_rankings: RankingEntry[];
  pitching_rankings: RankingEntry[];
}

export interface SeasonOption {
  id: number;
  name: string;
}

export interface DashboardData {
  recent_game_results: RecentGameResult[];
  batting_stats: BattingStats;
  pitching_stats: PitchingStats;
  group_rankings: GroupRanking[];
  available_years: number[];
}

export async function getDashboardData(
  year?: string,
  matchType?: string,
): Promise<DashboardData | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    const client = cookieStore.get("client")?.value;
    const uid = cookieStore.get("uid")?.value;

    if (!accessToken || !client || !uid) {
      return null;
    }

    const params = new URLSearchParams();
    if (year && year !== "通算") params.append("year", year);
    if (matchType && matchType !== "全て")
      params.append("match_type", matchType);
    const query = params.toString();
    const url = `${RAILS_API_URL}/api/v2/dashboard${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access-token": accessToken,
        client: client,
        uid: uid,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Dashboard API error:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    captureServerActionError(error, { action: "getDashboardData" });
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value;
  const client = cookieStore.get("client")?.value;
  const uid = cookieStore.get("uid")?.value;

  if (!accessToken || !client || !uid) return null;

  return {
    "Content-Type": "application/json",
    "access-token": accessToken,
    client,
    uid,
  };
}

function buildFilterQuery(
  year?: string,
  matchType?: string,
  seasonId?: string,
): string {
  const params = new URLSearchParams();
  if (year && year !== "通算") params.append("year", year);
  if (matchType && matchType !== "全て") params.append("match_type", matchType);
  if (seasonId) params.append("season_id", seasonId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getAvailableSeasons(): Promise<SeasonOption[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return [];

    const url = `${RAILS_API_URL}/api/v1/seasons`;
    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    captureServerActionError(error, { action: "getAvailableSeasons" });
    console.error("Error fetching seasons:", error);
    return [];
  }
}

export async function getFilteredBattingStats(
  year?: string,
  matchType?: string,
  seasonId?: string,
): Promise<BattingStats | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;

    const query = buildFilterQuery(year, matchType, seasonId);
    const url = `${RAILS_API_URL}/api/v2/dashboard/batting_stats${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    captureServerActionError(error, { action: "getFilteredBattingStats" });
    console.error("Error fetching batting stats:", error);
    return null;
  }
}

export async function getFilteredPitchingStats(
  year?: string,
  matchType?: string,
  seasonId?: string,
): Promise<PitchingStats | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;

    const query = buildFilterQuery(year, matchType, seasonId);
    const url = `${RAILS_API_URL}/api/v2/dashboard/pitching_stats${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    captureServerActionError(error, { action: "getFilteredPitchingStats" });
    console.error("Error fetching pitching stats:", error);
    return null;
  }
}
