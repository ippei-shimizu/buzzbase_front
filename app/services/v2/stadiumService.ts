"use server";

import type {
  CreateStadiumPayload,
  Stadium,
  StadiumSearchResponse,
} from "@app/interface/stadium";
import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import {
  type ActionResult,
  getAuthHeaders,
  UNAUTHENTICATED_RESULT,
} from "./authHeaders";

interface SearchStadiumsParams {
  q?: string;
  prefecture_id?: number;
  per_page?: number;
}

/**
 * 球場マスタを部分一致検索する（GET /api/v2/stadiums）。
 * 失敗時は空の検索結果を返す。
 */
export async function searchStadiums(
  params: SearchStadiumsParams = {},
): Promise<StadiumSearchResponse> {
  const empty: StadiumSearchResponse = {
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
    if (params.prefecture_id != null)
      query.append("prefecture_id", String(params.prefecture_id));
    if (params.per_page != null)
      query.append("per_page", String(params.per_page));

    const response = await fetch(`${RAILS_API_URL}/api/v2/stadiums?${query}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return empty;
    return await response.json();
  } catch (error) {
    captureServerActionError(error, { action: "searchStadiums" });
    return empty;
  }
}

/**
 * 球場マスタを新規作成する（POST /api/v2/stadiums）。
 * 成否を ActionResult で返す。
 */
export async function createStadium(
  payload: CreateStadiumPayload,
): Promise<ActionResult<Stadium>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return UNAUTHENTICATED_RESULT;

    const response = await fetch(`${RAILS_API_URL}/api/v2/stadiums`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ stadium: payload }),
    });
    const body = await response.json();
    if (!response.ok) {
      return { ok: false, errors: body.errors ?? ["球場の作成に失敗しました"] };
    }
    return { ok: true, data: body };
  } catch (error) {
    captureServerActionError(error, { action: "createStadium" });
    return { ok: false, errors: ["球場の作成に失敗しました"] };
  }
}
