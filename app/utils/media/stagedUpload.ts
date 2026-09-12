import type { MediaUploadResult, PreparedMedia } from "./uploadPipeline";
import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";

/** ステージ中のメディアをアップロード対象へ変換する。メモは完了通知と一緒に送る。 */
export function toPreparedMedia(asset: StagedMediaAsset): PreparedMedia {
  return {
    mediaType: asset.mediaType,
    contentType: asset.contentType,
    file: asset.file,
    thumbnail: asset.thumbnail,
    durationSeconds: asset.durationSeconds,
    width: asset.width,
    height: asset.height,
    memo: asset.memo,
  };
}

/** ステージ中メディアが持つ object URL をまとめて解放する（サムネイル用と再生用の2本）。 */
export function revokeStagedObjectUrls(asset: StagedMediaAsset): void {
  if (asset.previewUrl) URL.revokeObjectURL(asset.previewUrl);
  if (asset.playbackUrl) URL.revokeObjectURL(asset.playbackUrl);
}

export interface StagedUploadSummary {
  uploaded: number;
  canceled: number;
  limitReached: number;
  rejected: number;
  technical: number;
  /**
   * ノートごと取り消すべきか。
   *
   * ノート保存後に一括アップロードする都合上、失敗すると「本文だけのノート」が残る。
   * 添付が前提で書かれたノートではそれが望ましくないため取り消す。
   * ただし取り消すのは技術的失敗（通信断・5xx など）だけに限る。ユーザーが自分で
   * 中断した場合や、サーバーが内容を理由に拒否した場合まで巻き添えにすると、
   * ユーザーが書いた本文を本人の意図に反して消すことになる。
   */
  shouldRollbackNote: boolean;
}

/** 一括アップロードの結果を集計し、ノートをロールバックすべきかを決める。 */
export function summarizeStagedUploads(
  results: MediaUploadResult[],
): StagedUploadSummary {
  const summary = {
    uploaded: 0,
    canceled: 0,
    limitReached: 0,
    rejected: 0,
    technical: 0,
  };

  for (const result of results) {
    if (result.ok) {
      summary.uploaded += 1;
      continue;
    }
    if (result.reason === "canceled") summary.canceled += 1;
    if (result.reason === "limit_reached") summary.limitReached += 1;
    if (result.reason === "rejected") summary.rejected += 1;
    if (result.reason === "technical") summary.technical += 1;
  }

  return { ...summary, shouldRollbackNote: summary.technical > 0 };
}

/**
 * ロールバックしなかったときにユーザーへ伝える要約。伝えることが無ければ null。
 * 中断・拒否は「ノートは保存されている」ことを必ず添える（消えたと誤解させないため）。
 */
export function buildStagedUploadNotice(
  summary: StagedUploadSummary,
): string | null {
  const parts: string[] = [];
  if (summary.canceled > 0)
    parts.push(`${summary.canceled}件のアップロードを中断しました`);
  if (summary.rejected > 0)
    parts.push(`${summary.rejected}件は保存できませんでした`);
  if (parts.length === 0) return null;

  return `ノートは保存済みです。${parts.join("。")}。`;
}
