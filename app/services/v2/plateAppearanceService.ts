"use server";

import type {
  PlateAppearanceListResponse,
  PlateAppearanceV2,
  PlateAppearanceV2Input,
} from "@app/interface/plateAppearanceV2";
import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import {
  type ActionResult,
  getAuthHeaders,
  unauthenticatedResult,
} from "./authHeaders";

/**
 * 試合単位の打席一覧を取得する（GET /api/v2/plate_appearances/by_game/:id）。
 * batter_box_number 昇順・マスタ include 済み。失敗時は空配列。
 */
export async function getPlateAppearancesByGame(
  gameResultId: number,
): Promise<PlateAppearanceV2[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return [];

    const response = await fetch(
      `${RAILS_API_URL}/api/v2/plate_appearances/by_game/${gameResultId}`,
      { headers, cache: "no-store" },
    );
    if (!response.ok) return [];

    const body: PlateAppearanceListResponse = await response.json();
    return body.plate_appearances ?? [];
  } catch (error) {
    captureServerActionError(error, { action: "getPlateAppearancesByGame" });
    return [];
  }
}

/**
 * 打席詳細の取得結果。403（他ユーザーかつ相互フォローでない）は
 * 不存在と区別して案内文を出し分けるため、専用の status で返す。
 */
export type PlateAppearanceDetailResult =
  | { status: "ok"; plateAppearance: PlateAppearanceV2 }
  | { status: "forbidden" }
  | { status: "unavailable" };

/**
 * 打席を1件取得する（GET /api/v2/plate_appearances/:id）。
 * 他ユーザーの打席は相互フォローの場合のみ取得できる。
 */
export async function getPlateAppearanceV2(
  id: number,
): Promise<PlateAppearanceDetailResult> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "unavailable" };

    const response = await fetch(
      `${RAILS_API_URL}/api/v2/plate_appearances/${id}`,
      { headers, cache: "no-store" },
    );
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "unavailable" };

    return {
      status: "ok",
      plateAppearance: (await response.json()) as PlateAppearanceV2,
    };
  } catch (error) {
    captureServerActionError(error, { action: "getPlateAppearanceV2" });
    return { status: "unavailable" };
  }
}

/**
 * 打席を1件作成する（POST /api/v2/plate_appearances）。
 * batting_result / is_new_format はサーバー側で付与される。
 */
export async function createPlateAppearanceV2(
  input: PlateAppearanceV2Input,
): Promise<ActionResult<PlateAppearanceV2>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return unauthenticatedResult();

    const response = await fetch(`${RAILS_API_URL}/api/v2/plate_appearances`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ plate_appearance: input }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        errors: body?.errors ?? ["打席結果の保存に失敗しました"],
      };
    }
    return { ok: true, data: body };
  } catch (error) {
    captureServerActionError(error, { action: "createPlateAppearanceV2" });
    return { ok: false, errors: ["打席結果の保存に失敗しました"] };
  }
}

/**
 * 打席を更新する（PATCH /api/v2/plate_appearances/:id）。
 */
export async function updatePlateAppearanceV2(
  id: number,
  input: PlateAppearanceV2Input,
): Promise<ActionResult<PlateAppearanceV2>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return unauthenticatedResult();

    const response = await fetch(
      `${RAILS_API_URL}/api/v2/plate_appearances/${id}`,
      {
        method: "PATCH",
        headers,
        cache: "no-store",
        body: JSON.stringify({ plate_appearance: input }),
      },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        errors: body?.errors ?? ["打席結果の更新に失敗しました"],
      };
    }
    return { ok: true, data: body };
  } catch (error) {
    captureServerActionError(error, { action: "updatePlateAppearanceV2" });
    return { ok: false, errors: ["打席結果の更新に失敗しました"] };
  }
}

/**
 * 打席を削除する（DELETE /api/v2/plate_appearances/:id）。
 */
export async function deletePlateAppearanceV2(
  id: number,
): Promise<ActionResult<null>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return unauthenticatedResult();

    const response = await fetch(
      `${RAILS_API_URL}/api/v2/plate_appearances/${id}`,
      { method: "DELETE", headers, cache: "no-store" },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        ok: false,
        errors: body?.errors ?? ["打席結果の削除に失敗しました"],
      };
    }
    return { ok: true, data: null };
  } catch (error) {
    captureServerActionError(error, { action: "deletePlateAppearanceV2" });
    return { ok: false, errors: ["打席結果の削除に失敗しました"] };
  }
}
