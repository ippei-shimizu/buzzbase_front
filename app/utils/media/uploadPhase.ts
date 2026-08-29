/**
 * アップロードの進行フェーズ。mobile の UploadPhase と同じ区切り・同じ文言にする。
 *
 * Server Action を持つモジュールから切り離しておくことで、表示側が
 * `next/cache` などサーバー専用の依存を引き込まずに済む。
 */
export type UploadPhase =
  | "idle"
  | "compressing"
  | "uploading"
  | "finalizing"
  | "done"
  | "error";

export const UPLOAD_PHASE_LABEL: Partial<Record<UploadPhase, string>> = {
  compressing: "圧縮中…",
  uploading: "アップロード中…",
  finalizing: "仕上げ中…",
};
