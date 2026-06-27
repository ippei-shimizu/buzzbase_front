"use server";

import { cookies } from "next/headers";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";

export interface BattingStatsRow {
  label: string;
  opponent?: string;
  games: number;
  plate_appearances: number;
  at_bats: number;
  hit: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
  runs_batted_in: number;
  run: number;
  strike_out: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  stealing_base: number;
  caught_stealing: number;
  error: number;
  batting_average: number;
  slugging_percentage: number;
  ops: number;
  iso: number;
  bb_per_k: number;
  babip: number;
}

export interface PitchingStatsRow {
  label: string;
  opponent?: string;
  appearances: number;
  win: number;
  loss: number;
  hold: number;
  saves: number;
  complete_games: number;
  shutouts: number;
  innings_pitched: number;
  hits_allowed: number;
  home_runs_hit: number;
  strikeouts: number;
  base_on_balls: number;
  hit_by_pitch: number;
  run_allowed: number;
  earned_run: number;
  number_of_pitches: number;
  era: number;
  whip: number;
  k_per_nine: number;
  bb_per_nine: number;
  k_bb: number;
}

export type StatsPeriod = "yearly" | "monthly" | "daily";

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

export async function getIsAuthenticated(): Promise<boolean> {
  const headers = await getAuthHeaders();
  return headers !== null;
}

export async function getBattingStats(
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
  tournamentId?: string,
): Promise<BattingStatsRow[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return [];

    const params = new URLSearchParams({ period });
    if (year && year !== "通算") params.append("year", year);
    if (seasonId) params.append("season_id", seasonId);
    if (tournamentId) params.append("tournament_id", tournamentId);

    const response = await fetch(
      `${RAILS_API_URL}/api/v2/stats/batting?${params}`,
      { headers, cache: "no-store" },
    );
    if (!response.ok) return [];

    const data = await response.json();
    return data.rows ?? [];
  } catch (error) {
    captureServerActionError(error, { action: "getBattingStats" });
    return [];
  }
}

export async function getPitchingStats(
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
  tournamentId?: string,
): Promise<PitchingStatsRow[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return [];

    const params = new URLSearchParams({ period });
    if (year && year !== "通算") params.append("year", year);
    if (seasonId) params.append("season_id", seasonId);
    if (tournamentId) params.append("tournament_id", tournamentId);

    const response = await fetch(
      `${RAILS_API_URL}/api/v2/stats/pitching?${params}`,
      { headers, cache: "no-store" },
    );
    if (!response.ok) return [];

    const data = await response.json();
    return data.rows ?? [];
  } catch (error) {
    captureServerActionError(error, { action: "getPitchingStats" });
    return [];
  }
}
