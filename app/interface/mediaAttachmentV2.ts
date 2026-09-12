// v2 メディア添付 API（/api/v2/media_attachments）の型。
// レスポンスのキーは back のシリアライザ（V2::MediaAttachmentSerializer）に合わせて snake_case のまま扱う。

import type { MediaType, NoteMediaAttachment } from "./baseballNoteV2";

export type { MediaType, NoteMediaAttachment };

/** POST /api/v2/media_attachments/presign のパラメータ。 */
export interface MediaAttachmentPresignInput {
  baseball_note_id: number;
  media_type: MediaType;
  /** R2 へ PUT するときの Content-Type。署名に含まれるため PUT 時と必ず一致させる。 */
  content_type: string;
}

/**
 * presign のレスポンス。この時点で `status: "pending"` のレコードが作られている。
 * `upload_url` は10分で失効するため、発行時刻とセットで扱うこと。
 */
export interface MediaAttachmentPresignResponse {
  id: number;
  media_type: MediaType;
  status: "pending";
  upload_url: string;
  /** 動画のみ。サムネイル画像（image/jpeg）を PUT する先。 */
  thumbnail_upload_url: string | null;
}

/**
 * アップロード完了通知のパラメータ。
 * back は `file_size_bytes` キーの有無で「完了通知」と「メモ更新」を判別するため、
 * 完了通知では必ず含めること。
 */
export interface MediaAttachmentCompleteInput {
  file_size_bytes: number;
  duration_seconds?: number;
  width?: number;
  height?: number;
  memo?: string;
}

/** メモだけの更新。`file_size_bytes` を含めてはならない（完了通知として扱われる）。 */
export interface MediaAttachmentMemoInput {
  memo: string;
}

/**
 * ノート新規作成中（baseball_note_id 未確定）にブラウザ側で保持する選択済みメディア。
 * ノート保存成功後にまとめてアップロードする。
 */
export interface StagedMediaAsset {
  localId: string;
  /** 圧縮・変換まで済ませた実データ。presign の content_type はこの blob の type と揃える。 */
  file: Blob;
  fileName: string;
  mediaType: MediaType;
  contentType: string;
  /** 動画の場合のみ生成したサムネイル。生成に失敗した場合は null。 */
  thumbnail: Blob | null;
  /** 一覧のサムネイル表示用 object URL。解放漏れを防ぐため破棄時に revokeObjectURL する。 */
  previewUrl: string | null;
  /**
   * 再生用の object URL（動画のみ）。
   * previewUrl は動画だとサムネイル画像を指すため、video 要素にはこちらを渡す。
   */
  playbackUrl: string | null;
  durationSeconds?: number;
  width?: number;
  height?: number;
  memo: string;
}
