import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { getAuthHeaders } from "./authHeaders";

/**
 * 取得系 Server Action の戻り値。
 * dashboardStatsService が使う StatsFetchResult と同じ判別可能ユニオンで、
 * 「Pro 未加入・非公開などで見られない（forbidden）」「取得に失敗した（error）」
 * 「取得できた（ok / データが空配列でも ok）」を必ず区別する。
 * 失敗を空データへ丸めると「記録が 0 件」と誤表示してしまうため統合しない。
 */
export type FetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "error" };

/**
 * 更新系 Server Action の戻り値。
 * back は上限超過・Pro 限定機能を 403 + `{ error: "..." }` で返すため、
 * バリデーションエラー（422）と区別できるよう reason を持たせて Paywall へ倒せるようにする。
 */
export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "forbidden"; errors: string[] }
  | { ok: false; reason: "error"; errors: string[] };

/** 削除系エンドポイントの共通レスポンス。 */
export interface DeletedResponse {
  message: string;
}

/**
 * back のエラーレスポンスをメッセージ配列へ正規化する。
 * 422 は `{ errors: string[] }`、403 は `{ error: string }` と形が違うため両方を吸収する。
 */
export function extractErrors(body: unknown, fallback: string): string[] {
  if (typeof body === "object" && body !== null) {
    const { errors, error } = body as { errors?: unknown; error?: unknown };
    if (Array.isArray(errors) && errors.length > 0) return errors.map(String);
    if (typeof error === "string" && error !== "") return [error];
  }
  return [fallback];
}

/**
 * v2 API の GET を叩く。
 *
 * @param path `/api/v2/...` から始まるパス（クエリを含めてよい）
 * @param action Sentry に送るアクション名
 */
export async function fetchV2<T>(
  path: string,
  action: string,
): Promise<FetchResult<T>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "error" };

    const response = await fetch(`${RAILS_API_URL}${path}`, {
      headers,
      cache: "no-store",
    });

    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    captureServerActionError(error, { action });
    return { status: "error" };
  }
}

/**
 * 単一リソース取得系 Server Action の戻り値。
 * 他ユーザーのリソースを 404 で隠す（存在自体を漏らさない）エンドポイント向けに、
 * FetchResult へ `not_found` を足したもの。
 * 「見つからない」を error に丸めると、リンク切れなのに「通信に失敗しました」と誤案内してしまう。
 */
export type DetailFetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "error" };

/**
 * v2 API の GET を叩き、404 を「見つからない」として区別して返す。
 *
 * @param path `/api/v2/...` から始まるパス（クエリを含めてよい）
 * @param action Sentry に送るアクション名
 */
export async function fetchDetailV2<T>(
  path: string,
  action: string,
): Promise<DetailFetchResult<T>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { status: "error" };

    const response = await fetch(`${RAILS_API_URL}${path}`, {
      headers,
      cache: "no-store",
    });

    if (response.status === 403) return { status: "forbidden" };
    if (response.status === 404) return { status: "not_found" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    captureServerActionError(error, { action });
    return { status: "error" };
  }
}

interface MutateOptions {
  method: "POST" | "PATCH" | "DELETE";
  /** JSON 化して送るリクエストボディ。DELETE のように本文が無い場合は省略する。 */
  body?: unknown;
  action: string;
  /** back がエラー詳細を返さなかったときに表示するメッセージ。 */
  fallbackMessage: string;
}

/**
 * v2 API の更新系（POST / PATCH / DELETE）を叩く。
 * 403 は reason:"forbidden" として返し、上限超過・Pro 限定の案内へ分岐できるようにする。
 */
export async function mutateV2<T>(
  path: string,
  { method, body, action, fallbackMessage }: MutateOptions,
): Promise<MutationResult<T>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      return { ok: false, reason: "error", errors: ["ログインが必要です"] };
    }

    const response = await fetch(`${RAILS_API_URL}${path}`, {
      method,
      headers,
      cache: "no-store",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        reason: response.status === 403 ? "forbidden" : "error",
        errors: extractErrors(payload, fallbackMessage),
      };
    }
    return { ok: true, data: payload as T };
  } catch (error) {
    captureServerActionError(error, { action });
    return { ok: false, reason: "error", errors: [fallbackMessage] };
  }
}

/** 未定義・null の値を除いたクエリ文字列（先頭 `?` 付き）を組み立てる。値が無ければ空文字。 */
export function buildQuery(
  params: Record<string, string | number | null | undefined>,
): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}
