"use server";

import { cookies } from "next/headers";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";

// 分析系エンドポイント共通のフィルタ。
export interface AnalysisFilters {
  year?: string;
  matchType?: string;
  seasonId?: string;
  tournamentId?: string;
}

export interface HeadlineStats {
  batting_average: number;
  hit: number;
  home_run: number;
  runs_batted_in: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  at_bats: number;
}

export interface AdditionalStats {
  games: number;
  plate_appearances: number;
  two_base_hit: number;
  three_base_hit: number;
  total_bases: number;
  run: number;
  strike_out: number;
  swinging_strike_out: number;
  looking_strike_out: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  stealing_base: number;
  caught_stealing: number;
  iso: number;
  isod: number;
  bb_per_k: number;
}

export interface HitLocationPoint {
  x: number;
  y: number;
  plate_result_id: number;
}

export interface HitLocationData {
  points: HitLocationPoint[];
}

export interface HitDirection {
  id: number;
  label: string;
  count: number;
  top_category: string;
  at_bats: number;
  hits: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
}

export interface HomeRunDirection {
  id: number;
  label: string;
  count: number;
}

export interface HitDirectionData {
  directions: HitDirection[];
  home_runs: HomeRunDirection[];
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

function buildQuery(filters: AnalysisFilters): string {
  const params = new URLSearchParams();
  if (filters.year && filters.year !== "通算")
    params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  if (filters.tournamentId)
    params.append("tournament_id", filters.tournamentId);
  return params.toString();
}

async function fetchAnalysis<T>(
  path: string,
  filters: AnalysisFilters,
  action: string,
  fallback: T,
): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return fallback;
    const query = buildQuery(filters);
    const response = await fetch(
      `${RAILS_API_URL}/api/v2/stats/${path}?${query}`,
      { headers, cache: "no-store" },
    );
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch (error) {
    captureServerActionError(error, { action });
    return fallback;
  }
}

export async function getHeadlineStats(
  filters: AnalysisFilters = {},
): Promise<HeadlineStats | null> {
  return fetchAnalysis<HeadlineStats | null>(
    "headline_stats",
    filters,
    "getHeadlineStats",
    null,
  );
}

export async function getAdditionalStats(
  filters: AnalysisFilters = {},
): Promise<AdditionalStats | null> {
  return fetchAnalysis<AdditionalStats | null>(
    "additional_stats",
    filters,
    "getAdditionalStats",
    null,
  );
}

export async function getHitLocations(
  filters: AnalysisFilters = {},
): Promise<HitLocationData> {
  return fetchAnalysis<HitLocationData>(
    "hit_locations",
    filters,
    "getHitLocations",
    { points: [] },
  );
}

export async function getHitDirections(
  filters: AnalysisFilters = {},
): Promise<HitDirectionData> {
  return fetchAnalysis<HitDirectionData>(
    "hit_directions",
    filters,
    "getHitDirections",
    { directions: [], home_runs: [] },
  );
}
