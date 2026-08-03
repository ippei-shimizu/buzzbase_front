"use server";

import type {
  BaseballNoteCreateInput,
  BaseballNoteFilters,
  BaseballNoteUpdateInput,
  BaseballNoteV2,
  NoteFetchResult,
} from "@app/interface/baseballNoteV2";
import { revalidatePath } from "next/cache";
import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import {
  type ActionResult,
  getAuthHeaders,
  unauthenticatedResult,
} from "./authHeaders";

const NOTES_PATH = "/api/v2/baseball_notes";

/**
 * 一覧の絞り込みクエリを組み立てる。
 * 値が無いキーは送らない（back は空文字を「その値で絞り込む」と解釈しうるため）。
 */
function buildNotesQuery(filters: BaseballNoteFilters): string {
  const params = new URLSearchParams();
  if (filters.date) params.append("date", filters.date);
  if (filters.practiceLogId)
    params.append("practice_log_id", String(filters.practiceLogId));
  if (filters.practiceSessionId)
    params.append("practice_session_id", String(filters.practiceSessionId));
  if (filters.gameResultId)
    params.append("game_result_id", String(filters.gameResultId));
  if (filters.improvementThemeId)
    params.append("improvement_theme_id", String(filters.improvementThemeId));
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * 送信ペイロードから `undefined` のキーを取り除く。
 *
 * back は `game_result_ids` / `improvement_theme_ids` / `tag_ids` について
 * 「キー未送信＝変更なし」「`[]`＝全解除」の部分更新セマンティクスを持つ。
 * そのため `undefined` は落とし、`null` と `[]` は必ず残す（`[]` を落とすと
 * 「全解除」が「変更なし」にすり替わり、逆に既定値を補うと既存の紐付けを消す）。
 */
function compactNoteInput(
  input: BaseballNoteUpdateInput,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
}

/** back のエラーレスポンス（422 の `errors` 配列 / 403 の `error` 文字列）を配列に揃える。 */
function extractErrors(body: unknown, fallback: string): string[] {
  if (typeof body === "object" && body !== null) {
    const { errors, error } = body as { errors?: unknown; error?: unknown };
    if (Array.isArray(errors) && errors.length > 0) return errors as string[];
    if (typeof error === "string") return [error];
  }
  return [fallback];
}

/** ノート一覧の再検証。作成・更新・削除の後に呼ぶ。 */
async function revalidateNotes(id?: number): Promise<void> {
  revalidatePath("/note");
  if (id) revalidatePath(`/note/${id}`);
}

/** GET /api/v2/baseball_notes */
export async function getBaseballNotes(
  filters: BaseballNoteFilters = {},
): Promise<NoteFetchResult<BaseballNoteV2[]>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "error" };

    const response = await fetch(
      `${RAILS_API_URL}${NOTES_PATH}${buildNotesQuery(filters)}`,
      { headers, cache: "no-store" },
    );
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as BaseballNoteV2[] };
  } catch (error) {
    captureServerActionError(error, { action: "getBaseballNotes" });
    return { status: "error" };
  }
}

/** GET /api/v2/baseball_notes/:id */
export async function getBaseballNote(
  id: number,
): Promise<NoteFetchResult<BaseballNoteV2>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "error" };

    const response = await fetch(`${RAILS_API_URL}${NOTES_PATH}/${id}`, {
      headers,
      cache: "no-store",
    });
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as BaseballNoteV2 };
  } catch (error) {
    captureServerActionError(error, { action: "getBaseballNote" });
    return { status: "error" };
  }
}

/** POST /api/v2/baseball_notes */
export async function createBaseballNote(
  input: BaseballNoteCreateInput,
): Promise<ActionResult<BaseballNoteV2>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return unauthenticatedResult();

    const response = await fetch(`${RAILS_API_URL}${NOTES_PATH}`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ baseball_note: compactNoteInput(input) }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        errors: extractErrors(body, "ノートの保存に失敗しました"),
      };
    }
    await revalidateNotes();
    return { ok: true, data: body as BaseballNoteV2 };
  } catch (error) {
    captureServerActionError(error, { action: "createBaseballNote" });
    return { ok: false, errors: ["ノートの保存に失敗しました"] };
  }
}

/**
 * PATCH /api/v2/baseball_notes/:id
 *
 * `input` に含めたキーだけが送られる。紐付け（試合 / 課題 / タグ）を編集していない
 * 画面からは該当キーを渡さないこと。渡すと back 側でその内容に置き換えられるため、
 * 空配列を既定値として補うような実装は既存の紐付けを消す事故になる。
 */
export async function updateBaseballNote(
  id: number,
  input: BaseballNoteUpdateInput,
): Promise<ActionResult<BaseballNoteV2>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return unauthenticatedResult();

    const response = await fetch(`${RAILS_API_URL}${NOTES_PATH}/${id}`, {
      method: "PATCH",
      headers,
      cache: "no-store",
      body: JSON.stringify({ baseball_note: compactNoteInput(input) }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        errors: extractErrors(body, "ノートの更新に失敗しました"),
      };
    }
    await revalidateNotes(id);
    return { ok: true, data: body as BaseballNoteV2 };
  } catch (error) {
    captureServerActionError(error, { action: "updateBaseballNote" });
    return { ok: false, errors: ["ノートの更新に失敗しました"] };
  }
}

/** DELETE /api/v2/baseball_notes/:id */
export async function deleteBaseballNote(
  id: number,
): Promise<ActionResult<null>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return unauthenticatedResult();

    const response = await fetch(`${RAILS_API_URL}${NOTES_PATH}/${id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return {
        ok: false,
        errors: extractErrors(body, "ノートの削除に失敗しました"),
      };
    }
    await revalidateNotes(id);
    return { ok: true, data: null };
  } catch (error) {
    captureServerActionError(error, { action: "deleteBaseballNote" });
    return { ok: false, errors: ["ノートの削除に失敗しました"] };
  }
}
