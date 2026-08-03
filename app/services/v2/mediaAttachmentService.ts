"use server";

import type {
  MediaAttachmentCompleteInput,
  MediaAttachmentMemoInput,
  MediaAttachmentPresignInput,
  MediaAttachmentPresignResponse,
  NoteMediaAttachment,
} from "@app/interface/mediaAttachmentV2";
import { revalidatePath } from "next/cache";
import {
  type DeletedResponse,
  type MutationResult,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/media_attachments";

/** 添付の増減・メモ更新はノート詳細と一覧の両方に出るため、まとめて再検証する。 */
async function revalidateNotes(noteId?: number): Promise<void> {
  revalidatePath("/note");
  if (noteId) revalidatePath(`/note/${noteId}`);
}

/**
 * 署名付きアップロード URL を発行する（POST /api/v2/media_attachments/presign）。
 *
 * 呼び出した時点で back に `status: "pending"` のレコードが作られる。
 * 無料枠（月3件）を使い切っている場合は 403（reason:"forbidden"）が返るため、
 * Pro 限定機能ではなく「無料枠超過」の文脈で案内すること。
 * `upload_url` の有効期限は10分。発行から時間が空いたら PUT せずに取り直す。
 */
export async function presignMediaUpload(
  input: MediaAttachmentPresignInput,
): Promise<MutationResult<MediaAttachmentPresignResponse>> {
  return mutateV2<MediaAttachmentPresignResponse>(`${BASE_PATH}/presign`, {
    method: "POST",
    body: { media_attachment: input },
    action: "presignMediaUpload",
    fallbackMessage: "アップロードの準備に失敗しました",
  });
}

/**
 * R2 への PUT 完了を back へ通知し、`pending` から `ready` へ遷移させる
 * （PATCH /api/v2/media_attachments/:id）。
 *
 * back は `file_size_bytes` キーの有無でメモ更新と区別するため必ず含める。
 * 自己申告値は R2 上の実サイズで上書きされたうえで上限が再検証され、
 * 超過や PUT 未達の場合は 422 とともに `failed` へ落ちる（`pending` のままにはならない）。
 */
export async function completeMediaUpload(
  id: number,
  input: MediaAttachmentCompleteInput,
  noteId?: number,
): Promise<MutationResult<NoteMediaAttachment>> {
  const result = await mutateV2<NoteMediaAttachment>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { media_attachment: input },
    action: "completeMediaUpload",
    fallbackMessage: "アップロードの完了処理に失敗しました",
  });
  if (result.ok) await revalidateNotes(noteId);
  return result;
}

/**
 * 添付ごとのメモを更新する（PATCH /api/v2/media_attachments/:id）。
 * `file_size_bytes` を送らないことで back 側は完了通知ではなくメモ更新として扱う。
 */
export async function updateMediaAttachmentMemo(
  id: number,
  input: MediaAttachmentMemoInput,
  noteId?: number,
): Promise<MutationResult<NoteMediaAttachment>> {
  const result = await mutateV2<NoteMediaAttachment>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { media_attachment: input },
    action: "updateMediaAttachmentMemo",
    fallbackMessage: "メモの保存に失敗しました",
  });
  if (result.ok) await revalidateNotes(noteId);
  return result;
}

/** 添付を削除する（DELETE /api/v2/media_attachments/:id）。R2 上の実体は back が非同期に消す。 */
export async function deleteMediaAttachment(
  id: number,
  noteId?: number,
): Promise<MutationResult<DeletedResponse>> {
  const result = await mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteMediaAttachment",
    fallbackMessage: "削除に失敗しました",
  });
  if (result.ok) await revalidateNotes(noteId);
  return result;
}
