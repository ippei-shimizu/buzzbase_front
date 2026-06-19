"use server";

import type {
  Pitcher,
  PitcherInput,
  PitcherListResponse,
} from "@app/interface/pitcher";
import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import {
  type ActionResult,
  getAuthHeaders,
  UNAUTHENTICATED_RESULT,
} from "./authHeaders";

interface GetPitchersParams {
  q?: string;
  team_id?: number | null;
  per_page?: number;
}

/**
 * 投手マスタ（current_user 固有）を取得する（GET /api/v2/pitchers）。
 * 失敗時は空の一覧を返す。
 */
export async function getPitchers(
  params: GetPitchersParams = {},
): Promise<PitcherListResponse> {
  const empty: PitcherListResponse = {
    data: [],
    pagination: {
      current_page: 1,
      per_page: 0,
      total_count: 0,
      total_pages: 0,
    },
  };
  try {
    const headers = await getAuthHeaders();
    if (!headers) return empty;

    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.team_id != null) query.append("team_id", String(params.team_id));
    if (params.per_page != null)
      query.append("per_page", String(params.per_page));

    const response = await fetch(`${RAILS_API_URL}/api/v2/pitchers?${query}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return empty;
    return await response.json();
  } catch (error) {
    captureServerActionError(error, { action: "getPitchers" });
    return empty;
  }
}

/**
 * 投手マスタを新規作成する（POST /api/v2/pitchers）。
 */
export async function createPitcher(
  input: PitcherInput,
): Promise<ActionResult<Pitcher>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return UNAUTHENTICATED_RESULT;

    const response = await fetch(`${RAILS_API_URL}/api/v2/pitchers`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ pitcher: input }),
    });
    const body = await response.json();
    if (!response.ok) {
      return { ok: false, errors: body.errors ?? ["投手の作成に失敗しました"] };
    }
    return { ok: true, data: body };
  } catch (error) {
    captureServerActionError(error, { action: "createPitcher" });
    return { ok: false, errors: ["投手の作成に失敗しました"] };
  }
}

/**
 * 投手マスタを更新する（PATCH /api/v2/pitchers/:id）。自分の投手のみ更新可。
 */
export async function updatePitcher(
  id: number,
  input: PitcherInput,
): Promise<ActionResult<Pitcher>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return UNAUTHENTICATED_RESULT;

    const response = await fetch(`${RAILS_API_URL}/api/v2/pitchers/${id}`, {
      method: "PATCH",
      headers,
      cache: "no-store",
      body: JSON.stringify({ pitcher: input }),
    });
    const body = await response.json();
    if (!response.ok) {
      return { ok: false, errors: body.errors ?? ["投手の更新に失敗しました"] };
    }
    return { ok: true, data: body };
  } catch (error) {
    captureServerActionError(error, { action: "updatePitcher" });
    return { ok: false, errors: ["投手の更新に失敗しました"] };
  }
}
