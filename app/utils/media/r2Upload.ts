export type R2PutResult =
  | { ok: true }
  | { ok: false; canceled: true }
  | { ok: false; canceled: false; status: number | null };

/**
 * 署名付き URL へ本体を直接 PUT する。
 *
 * back を経由せずブラウザから R2 へ直接送るため、認証ヘッダーは付けない
 * （署名が認可そのもので、余計なヘッダーは署名不一致の原因になる）。
 * `Content-Type` は presign 時に署名へ含まれているので、同じ値を必ず送る。
 *
 * 進捗はバイト単位では取得できない。fetch のリクエストボディはストリーム化しても
 * 送信量を通知しないため、呼び出し側はフェーズと件数で進捗を表現すること。
 */
export async function putToPresignedUrl(
  uploadUrl: string,
  body: Blob,
  contentType: string,
  signal?: AbortSignal,
): Promise<R2PutResult> {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
      signal,
    });
    if (response.ok) return { ok: true };
    return { ok: false, canceled: false, status: response.status };
  } catch (error) {
    if (signal?.aborted || (error as Error)?.name === "AbortError") {
      return { ok: false, canceled: true };
    }
    return { ok: false, canceled: false, status: null };
  }
}
