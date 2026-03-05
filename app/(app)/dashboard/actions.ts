"use server";

import { cookies } from "next/headers";
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

export interface BattingStats {
  aggregate: {
    number_of_matches: number;
    hit: number;
    two_base_hit: number;
    three_base_hit: number;
    home_run: number;
    total_bases: number;
    runs_batted_in: number;
    run: number;
    stealing_base: number;
    caught_stealing: number;
    times_at_bat: number;
    at_bats: number;
    base_on_balls: number;
    hit_by_pitch: number;
    sacrifice_hit: number;
    sacrifice_fly: number;
    strike_out: number;
    error: number;
  } | null;
  calculated: {
    batting_average: number;
    on_base_percentage: number;
    slugging_percentage: number;
    ops: number;
    iso: number;
    bb_per_k: number;
    isod: number;
  } | null;
}

export interface PitchingStats {
  aggregate: {
    number_of_appearances: number;
    win: number;
    loss: number;
    complete_games: number;
    shutouts: number;
    saves: number;
    hold: number;
    innings_pitched: number;
    hits_allowed: number;
    home_runs_hit: number;
    strikeouts: number;
    base_on_balls: number;
    hit_by_pitch: number;
    run_allowed: number;
    earned_run: number;
  } | null;
  calculated: {
    era: number;
    win_percentage: number;
    whip: number;
    k_per_nine: number;
    bb_per_nine: number;
    k_bb: number;
  } | null;
}

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
    console.error("Error fetching pitching stats:", error);
    return null;
  }
}
