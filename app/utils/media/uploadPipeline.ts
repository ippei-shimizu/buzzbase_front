import type { UploadPhase } from "./uploadPhase";
import type {
  MediaType,
  NoteMediaAttachment,
} from "@app/interface/mediaAttachmentV2";
import {
  completeMediaUpload,
  presignMediaUpload,
} from "@app/services/v2/mediaAttachmentService";
import { isExpiredUploadStatus, isPresignExpiring } from "./mediaLimits";
import { putToPresignedUrl } from "./r2Upload";

/** 圧縮・サムネイル生成まで済ませた、これ以上ブラウザ API を触らないアップロード対象。 */
export interface PreparedMedia {
  mediaType: MediaType;
  contentType: string;
  file: Blob;
  thumbnail: Blob | null;
  durationSeconds?: number;
  width?: number;
  height?: number;
  memo?: string;
}

/**
 * アップロード結果。ロールバック要否を呼び出し側が判断できるよう、
 * 「ユーザーが止めた」「サーバーに拒否された」「技術的に失敗した」を必ず分ける。
 */
export type MediaUploadResult =
  | { ok: true; attachment: NoteMediaAttachment }
  /** 無料枠（月3件）を使い切っている。ノートは保存済みのままにする。 */
  | { ok: false; reason: "limit_reached"; message: string }
  /** ユーザーが中断した。書きかけの本文を巻き添えにしてはならない。 */
  | { ok: false; reason: "canceled" }
  /** サーバーが内容を理由に拒否した（上限超過など）。ノートは残す。 */
  | { ok: false; reason: "rejected"; message: string }
  /** 通信断・5xx など、ユーザーの意図とも内容とも無関係な失敗。 */
  | { ok: false; reason: "technical"; message: string };

// 署名 URL の失効に備えた presign のやり直し回数（初回 + 1回）。
const MAX_PRESIGN_ATTEMPTS = 2;

const NETWORK_ERROR_MESSAGE =
  "アップロードに失敗しました。通信環境を確認して再度お試しください。";

interface UploadOptions {
  signal?: AbortSignal;
  onPhase?: (phase: UploadPhase) => void;
  /** テストから時刻を差し替えるための注入点。 */
  now?: () => number;
}

function canceledResult(): MediaUploadResult {
  return { ok: false, reason: "canceled" };
}

/**
 * presign → R2 へ直接 PUT → 完了通知、の一連の流れを実行する。
 *
 * 署名 URL の有効期限は10分しかないため、PUT が 401/403 で落ちた場合と、
 * サムネイル送信の直前に期限が近づいている場合は presign から取り直す
 * （古い pending レコードは back 側で1時間後に無料枠の集計から外れる）。
 */
export async function uploadPreparedMedia(
  prepared: PreparedMedia,
  baseballNoteId: number,
  { signal, onPhase, now = Date.now }: UploadOptions = {},
): Promise<MediaUploadResult> {
  for (let attempt = 0; attempt < MAX_PRESIGN_ATTEMPTS; attempt += 1) {
    const canRetry = attempt + 1 < MAX_PRESIGN_ATTEMPTS;
    if (signal?.aborted) return canceledResult();

    onPhase?.("uploading");
    const presigned = await presignMediaUpload({
      baseball_note_id: baseballNoteId,
      media_type: prepared.mediaType,
      content_type: prepared.contentType,
    });
    if (!presigned.ok) {
      if (presigned.reason === "forbidden") {
        return {
          ok: false,
          reason: "limit_reached",
          message:
            presigned.errors[0] ?? "今月のアップロード上限に達しています",
        };
      }
      return {
        ok: false,
        reason: "technical",
        message: presigned.errors[0] ?? NETWORK_ERROR_MESSAGE,
      };
    }
    const issuedAt = now();

    const putResult = await putToPresignedUrl(
      presigned.data.upload_url,
      prepared.file,
      prepared.contentType,
      signal,
    );
    if (!putResult.ok) {
      if (putResult.canceled) return canceledResult();
      if (canRetry && isExpiredUploadStatus(putResult.status ?? 0)) continue;
      return {
        ok: false,
        reason: "technical",
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    if (prepared.thumbnail && presigned.data.thumbnail_upload_url) {
      // 本体の送信が長引くと、サムネイルを送る頃には署名が切れている。
      if (canRetry && isPresignExpiring(issuedAt, now())) continue;

      const thumbnailResult = await putToPresignedUrl(
        presigned.data.thumbnail_upload_url,
        prepared.thumbnail,
        "image/jpeg",
        signal,
      );
      if (!thumbnailResult.ok) {
        if (thumbnailResult.canceled) return canceledResult();
        if (
          canRetry &&
          isExpiredUploadStatus(thumbnailResult.status ?? 0) &&
          !thumbnailResult.canceled
        ) {
          continue;
        }
        // サムネイルは表示上の補助でしかない。本体が届いている以上、ここで
        // 失敗させると送信済みの動画ごと捨てることになるため完了通知へ進む。
      }
    }

    if (signal?.aborted) return canceledResult();

    onPhase?.("finalizing");
    const completed = await completeMediaUpload(
      presigned.data.id,
      {
        file_size_bytes: prepared.file.size,
        ...(prepared.durationSeconds === undefined
          ? {}
          : { duration_seconds: prepared.durationSeconds }),
        ...(prepared.width === undefined ? {} : { width: prepared.width }),
        ...(prepared.height === undefined ? {} : { height: prepared.height }),
        ...(prepared.memo ? { memo: prepared.memo } : {}),
      },
      baseballNoteId,
    );
    if (!completed.ok) {
      // back は上限超過・PUT 未達を 422 で返しつつ、レコードを failed にしている。
      // 内容起因の拒否なので、ユーザーが書いたノート本文を巻き添えにはしない。
      return {
        ok: false,
        reason: "rejected",
        message: completed.errors[0] ?? "アップロードを完了できませんでした",
      };
    }

    onPhase?.("done");
    return { ok: true, attachment: completed.data };
  }

  return {
    ok: false,
    reason: "technical",
    message: "アップロードの有効期限が切れました。もう一度お試しください。",
  };
}
