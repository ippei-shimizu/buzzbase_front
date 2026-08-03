"use server";

import type {
  FilterOption,
  FilterValues,
} from "@app/components/filter/filterTypes";
import type { SeasonData } from "@app/interface";
import type {
  BattingStats,
  PitchingStats,
  StatsFetchResult,
} from "@app/interface/dashboardStats";
import { MATCH_TYPE_OPTIONS } from "@app/components/filter/matchTypeOptions";
import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { getAuthHeaders } from "./authHeaders";

/**
 * v2 ダッシュボード成績 API の絞り込みクエリを組み立てる。
 *
 * `userId` を渡すと他ユーザーの成績を参照する（未指定ならログインユーザー）。
 * 未指定（undefined）の絞り込みは送らない。バックエンドは値が無いキーを
 * 「絞り込まない」として扱うため、空文字を送ると意図しない条件になる。
 */
function buildStatsQuery(userId: number | undefined, filters: FilterValues) {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", String(userId));
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  if (filters.tournamentId)
    params.append("tournament_id", filters.tournamentId);
  if (filters.startMonth) params.append("start_month", filters.startMonth);
  if (filters.endMonth) params.append("end_month", filters.endMonth);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * v2 ダッシュボード成績 API を 1 本呼ぶ。
 *
 * 非公開アカウント（403）は `forbidden` として返し、その他の失敗は `error` にする。
 * 失敗を「成績 0 件」に丸めると誤った成績を表示してしまうため、必ず区別する。
 */
async function fetchStats<T>(
  path: "batting_stats" | "pitching_stats",
  userId: number | undefined,
  filters: FilterValues,
  action: string,
): Promise<StatsFetchResult<T>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "error" };

    const query = buildStatsQuery(userId, filters);
    const response = await fetch(
      `${RAILS_API_URL}/api/v2/dashboard/${path}${query}`,
      { headers, cache: "no-store" },
    );

    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    captureServerActionError(error, { action });
    return { status: "error" };
  }
}

/** GET /api/v2/dashboard/batting_stats */
export async function getDashboardBattingStats(
  userId?: number,
  filters: FilterValues = {},
): Promise<StatsFetchResult<BattingStats>> {
  return fetchStats<BattingStats>(
    "batting_stats",
    userId,
    filters,
    "getDashboardBattingStats",
  );
}

/** GET /api/v2/dashboard/pitching_stats */
export async function getDashboardPitchingStats(
  userId?: number,
  filters: FilterValues = {},
): Promise<StatsFetchResult<PitchingStats>> {
  return fetchStats<PitchingStats>(
    "pitching_stats",
    userId,
    filters,
    "getDashboardPitchingStats",
  );
}

export interface UserStatsFilterOptions {
  years: FilterOption[];
  matchTypes: FilterOption[];
  seasons: FilterOption[];
}

const emptyFilterOptions = (): UserStatsFilterOptions => ({
  years: [],
  matchTypes: [],
  seasons: [],
});

async function fetchJson<T>(
  path: string,
  headers: Record<string, string>,
  action: string,
): Promise<T[]> {
  try {
    const response = await fetch(`${RAILS_API_URL}${path}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return [];
    return (await response.json()) as T[];
  } catch (error) {
    captureServerActionError(error, { action });
    return [];
  }
}

interface UserMatchResult {
  date_and_time: string;
  match_type: string;
}

/**
 * マイページ成績タブの絞り込み選択肢（年度 / 種別 / シーズン）を取得する。
 *
 * 選択肢の供給元は v1 のまま。v2 に相当エンドポイントが無く、
 * 対象ユーザー（他ユーザーを含む）の記録から候補を導出する必要があるため。
 * 2 本は互いに独立して縮退するので、片方が落ちても残りのチップは出せる。
 */
export async function getUserStatsFilterOptions(
  userId: number,
): Promise<UserStatsFilterOptions> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return emptyFilterOptions();

    const [matchResults, seasons] = await Promise.all([
      fetchJson<UserMatchResult>(
        `/api/v1/match_index_user_id?user_id=${userId}`,
        headers,
        "getUserStatsFilterOptions:matchResults",
      ),
      fetchJson<SeasonData>(
        `/api/v1/seasons?user_id=${userId}`,
        headers,
        "getUserStatsFilterOptions:seasons",
      ),
    ]);

    const years = Array.from(
      new Set(
        matchResults
          .map((result) => new Date(result.date_and_time).getFullYear())
          .filter((year) => !Number.isNaN(year)),
      ),
    ).sort((a, b) => b - a);

    const recordedMatchTypes = new Set(
      matchResults.map((result) => result.match_type),
    );

    return {
      years: years.map((year) => ({ key: String(year), label: String(year) })),
      // 記録のある種別だけを出す（選んでも 0 件になる候補を出さないため）。
      matchTypes: MATCH_TYPE_OPTIONS.filter((option) =>
        recordedMatchTypes.has(option.key),
      ),
      seasons: seasons.map((season) => ({
        key: String(season.id),
        label: season.name,
      })),
    };
  } catch (error) {
    captureServerActionError(error, { action: "getUserStatsFilterOptions" });
    return emptyFilterOptions();
  }
}
