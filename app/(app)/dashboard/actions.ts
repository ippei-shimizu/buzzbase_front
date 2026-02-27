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
    home_run: number;
    runs_batted_in: number;
    stealing_base: number;
    times_at_bat: number;
    at_bats: number;
    base_on_balls: number;
    strike_out: number;
  } | null;
  calculated: {
    batting_average: number;
    on_base_percentage: number;
    slugging_percentage: number;
    ops: number;
    iso: number;
    bb_per_k: number;
  } | null;
}

export interface PitchingStats {
  aggregate: {
    number_of_appearances: number;
    win: number;
    loss: number;
    saves: number;
    hold: number;
    innings_pitched: number;
    strikeouts: number;
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

export interface DashboardData {
  recent_game_results: RecentGameResult[];
  batting_stats: BattingStats;
  pitching_stats: PitchingStats;
  group_rankings: GroupRanking[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    const client = cookieStore.get("client")?.value;
    const uid = cookieStore.get("uid")?.value;

    if (!accessToken || !client || !uid) {
      return null;
    }

    const response = await fetch(`${RAILS_API_URL}/api/v2/dashboard`, {
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
