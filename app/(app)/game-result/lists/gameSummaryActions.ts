"use server";

import type {
  GameSummary,
  GameSummaryFilters,
  GameSummaryResult,
} from "./gameSummaryTypes";
import { getAuthHeaders } from "@app/services/v2/authHeaders";
import { captureServerActionError } from "../../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../../constants/api";
import {
  getStatsFilterOptions,
  type StatsFilterOptions,
} from "../../stats/filterOptions";

function buildQuery(filters: GameSummaryFilters): string {
  const params = new URLSearchParams();
  if (filters.year && filters.year !== "通算")
    params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  if (filters.tournamentId)
    params.append("tournament_id", filters.tournamentId);
  return params.toString();
}

/**
 * 試合結果サマリー（勝敗・得失点・直近試合・月別試合数・対戦相手別）を取得する。
 * 認証ヘッダの current_user を対象にするため user_id は送らない。
 * 非公開アカウント時の 403 と未認証を呼び出し側で区別できるよう判別ユニオンを返す。
 */
export async function getGameSummary(
  filters: GameSummaryFilters = {},
): Promise<GameSummaryResult> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "unauthenticated" };

    const query = buildQuery(filters);
    const response = await fetch(
      `${RAILS_API_URL}/api/v2/stats/game_summary${query ? `?${query}` : ""}`,
      { headers, cache: "no-store" },
    );

    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "error" };
    return { status: "ok", data: (await response.json()) as GameSummary };
  } catch (error) {
    captureServerActionError(error, { action: "getGameSummary" });
    return { status: "error" };
  }
}

/**
 * サマリーのフィルタ選択肢（シーズン / 大会）をクライアントから取得するための
 * Server Action ラッパー。`getStatsFilterOptions` は next/headers を使う
 * サーバー専用モジュールのため、Client Component から直接呼べない。
 */
export async function getGameSummaryFilterOptions(): Promise<StatsFilterOptions> {
  return getStatsFilterOptions();
}
