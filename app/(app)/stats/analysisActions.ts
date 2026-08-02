"use server";

import type { FilterValues } from "@app/components/filter/filterTypes";
import type { ProGatedResult } from "@app/types/pro";
import { cookies } from "next/headers";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";
import {
  EMPTY_COUNT_SITUATIONS,
  EMPTY_PITCH_TYPES,
  EMPTY_PITCHER_FACEOFFS,
} from "./analysisFallbacks";

// 分析系エンドポイント共通のフィルタ。絞り込み UI と同じ形を使う。
export type AnalysisFilters = FilterValues;

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

export interface RunnersSituationSummary {
  batting_average: number;
  at_bats: number;
  hits: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
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

export interface PlateAppearanceCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface EraTrendPoint {
  month: number;
  era: number;
}

export interface ContactQualityCategory {
  id: number;
  label: string;
  count: number;
  percentage: number;
}

export interface ContactQualityData {
  breakdown: ContactQualityCategory[];
  total: number;
}

export interface TimingBreakdownCategory {
  id: number;
  label: string;
  count: number;
  percentage: number;
}

export interface TimingBreakdownData {
  breakdown: TimingBreakdownCategory[];
  total: number;
}

export interface CountSituation {
  at_bats: number;
  hits: number;
  batting_average: number;
}

export interface CountSituations {
  first_pitch: CountSituation;
  favorable_count: CountSituation;
  pinch_count: CountSituation;
  total_target_pa: number;
}

export interface PitcherResultCount {
  plate_result_id: number;
  plate_result_name: string;
  count: number;
}

export interface PitchTypeRow {
  id: number;
  label: string;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  total_bases: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_fly: number;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  result_counts: PitcherResultCount[];
}

export interface PitchTypeData {
  rows: PitchTypeRow[];
  total_target_pa: number;
}

export interface PitcherFaceoff {
  pitcher_id: number;
  pitcher_name: string;
  team_name: string | null;
  throw_hand: "right" | "left" | null;
  pitcher_style: string | null;
  velocity_zone: string | null;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  total_bases: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_fly: number;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  top_result: string;
  result_counts: PitcherResultCount[];
}

export interface PitcherFaceoffData {
  rows: PitcherFaceoff[];
  min_plate_appearances: number;
  total_target_pa: number;
}

export interface PitcherAttributeBucket {
  key: string | number | null;
  label: string;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  total_bases: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_fly: number;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  result_counts: PitcherResultCount[];
  display_order: number;
}

export interface PitcherAttributeSummaryData {
  by_throw_hand: PitcherAttributeBucket[];
  by_arm_angle: PitcherAttributeBucket[];
  by_velocity_zone: PitcherAttributeBucket[];
  by_pitcher_style: PitcherAttributeBucket[];
}

export type BattingTrendGranularity =
  | "game"
  | "month"
  | "year"
  | "recent_games";

export interface BattingTrendPoint {
  key: string;
  label: string;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  at_bats_in_period: number;
  cumulative_at_bats: number;
}

export interface BattingTrendData {
  granularity: BattingTrendGranularity;
  points: BattingTrendPoint[];
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
  if (filters.startMonth) params.append("start_month", filters.startMonth);
  if (filters.endMonth) params.append("end_month", filters.endMonth);
  return params.toString();
}

async function fetchProGatedAnalysis<T>(
  path: string,
  filters: AnalysisFilters,
  action: string,
  fallback: T,
  extra?: Record<string, string>,
): Promise<ProGatedResult<T>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "ok", data: fallback };
    const params = new URLSearchParams(buildQuery(filters));
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        params.append(key, value);
      }
    }
    const query = params.toString();
    const response = await fetch(
      `${RAILS_API_URL}/api/v2/stats/${path}?${query}`,
      { headers, cache: "no-store" },
    );
    if (response.status === 403) return { status: "pro_required" };
    if (!response.ok) return { status: "ok", data: fallback };
    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    captureServerActionError(error, { action });
    return { status: "ok", data: fallback };
  }
}

// Pro ゲートの無いエンドポイント用。403 も他の失敗と同じくフォールバックに畳む。
async function fetchAnalysis<T>(
  path: string,
  filters: AnalysisFilters,
  action: string,
  fallback: T,
  extra?: Record<string, string>,
): Promise<T> {
  const result = await fetchProGatedAnalysis(
    path,
    filters,
    action,
    fallback,
    extra,
  );
  return result.status === "ok" ? result.data : fallback;
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

export async function getRunnersSituation(
  filters: AnalysisFilters = {},
): Promise<RunnersSituationSummary | null> {
  return fetchAnalysis<RunnersSituationSummary | null>(
    "runners_situation",
    filters,
    "getRunnersSituation",
    null,
  );
}

export async function getBattingTrend(
  filters: AnalysisFilters = {},
  granularity: BattingTrendGranularity = "game",
): Promise<BattingTrendData> {
  return fetchAnalysis<BattingTrendData>(
    "batting_trend",
    filters,
    "getBattingTrend",
    { granularity, points: [] },
    { granularity },
  );
}

export async function getContactQualities(
  filters: AnalysisFilters = {},
): Promise<ContactQualityData> {
  return fetchAnalysis<ContactQualityData>(
    "contact_qualities",
    filters,
    "getContactQualities",
    { breakdown: [], total: 0 },
  );
}

export async function getTimingBreakdown(
  filters: AnalysisFilters = {},
): Promise<TimingBreakdownData> {
  return fetchAnalysis<TimingBreakdownData>(
    "timing_breakdown",
    filters,
    "getTimingBreakdown",
    { breakdown: [], total: 0 },
  );
}

/** count_situation_average の entitlement が必要。403 は pro_required として返す。 */
export async function getCountSituations(
  filters: AnalysisFilters = {},
): Promise<ProGatedResult<CountSituations>> {
  return fetchProGatedAnalysis<CountSituations>(
    "count_situations",
    filters,
    "getCountSituations",
    EMPTY_COUNT_SITUATIONS,
  );
}

/** pitch_type_average の entitlement が必要。403 は pro_required として返す。 */
export async function getPitchTypes(
  filters: AnalysisFilters = {},
): Promise<ProGatedResult<PitchTypeData>> {
  return fetchProGatedAnalysis<PitchTypeData>(
    "pitch_types",
    filters,
    "getPitchTypes",
    EMPTY_PITCH_TYPES,
  );
}

/** pitcher_faceoff_average の entitlement が必要。403 は pro_required として返す。 */
export async function getPitcherFaceoffs(
  filters: AnalysisFilters = {},
): Promise<ProGatedResult<PitcherFaceoffData>> {
  return fetchProGatedAnalysis<PitcherFaceoffData>(
    "pitcher_faceoffs",
    filters,
    "getPitcherFaceoffs",
    EMPTY_PITCHER_FACEOFFS,
  );
}

export async function getPitcherAttributeSummary(
  filters: AnalysisFilters = {},
): Promise<PitcherAttributeSummaryData> {
  return fetchAnalysis<PitcherAttributeSummaryData>(
    "pitcher_attribute_summary",
    filters,
    "getPitcherAttributeSummary",
    {
      by_throw_hand: [],
      by_arm_angle: [],
      by_velocity_zone: [],
      by_pitcher_style: [],
    },
  );
}

export async function getEraTrend(
  filters: AnalysisFilters = {},
): Promise<EraTrendPoint[]> {
  // era_trend は year/season/tournament のみで絞る。match_type は構造的に除外し、
  // 誤って matchType 付きで呼ばれても送信されないことを関数自身で保証する。
  const { matchType: _matchType, ...eraFilters } = filters;
  const result = await fetchAnalysis<{ trend: EraTrendPoint[] }>(
    "era_trend",
    eraFilters,
    "getEraTrend",
    { trend: [] },
  );
  return result.trend ?? [];
}

export async function getPlateAppearanceBreakdown(
  filters: AnalysisFilters = {},
): Promise<PlateAppearanceCategory[]> {
  const result = await fetchAnalysis<{ breakdown: PlateAppearanceCategory[] }>(
    "plate_appearance_breakdown",
    filters,
    "getPlateAppearanceBreakdown",
    { breakdown: [] },
  );
  return result.breakdown ?? [];
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

/** 全ユーザー共通で初期描画する打撃分析ブロック群（Pro 限定の3種は含めない）。 */
export interface AnalysisInitialData {
  headline: HeadlineStats | null;
  runnersSituation: RunnersSituationSummary | null;
  additional: AdditionalStats | null;
  hitLocations: HitLocationData;
  hitDirections: HitDirectionData;
  plateBreakdown: PlateAppearanceCategory[];
  contactQualities: ContactQualityData;
  timingBreakdown: TimingBreakdownData;
  pitcherAttributes: PitcherAttributeSummaryData;
  battingTrend: BattingTrendData;
}

/**
 * 打撃分析の初期表示ブロックをまとめて取得する（Server Component から SSR で呼ぶ）。
 * フィルタ既定は絞り込みなし（通算・全試合）、推移は試合単位。
 * Pro 限定の3種は entitlement を持つユーザーにだけ投げたいので、ここには含めず
 * 呼び出し側が Pro 判定と合わせて取得する。
 */
export async function getInitialAnalysisData(
  filters: AnalysisFilters = {},
  granularity: BattingTrendGranularity = "game",
): Promise<AnalysisInitialData> {
  const [
    headline,
    runnersSituation,
    additional,
    hitLocations,
    hitDirections,
    plateBreakdown,
    contactQualities,
    timingBreakdown,
    pitcherAttributes,
    battingTrend,
  ] = await Promise.all([
    getHeadlineStats(filters),
    getRunnersSituation(filters),
    getAdditionalStats(filters),
    getHitLocations(filters),
    getHitDirections(filters),
    getPlateAppearanceBreakdown(filters),
    getContactQualities(filters),
    getTimingBreakdown(filters),
    getPitcherAttributeSummary(filters),
    getBattingTrend(filters, granularity),
  ]);
  return {
    headline,
    runnersSituation,
    additional,
    hitLocations,
    hitDirections,
    plateBreakdown,
    contactQualities,
    timingBreakdown,
    pitcherAttributes,
    battingTrend,
  };
}
