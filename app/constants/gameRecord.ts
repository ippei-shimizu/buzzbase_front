import type { RecordPattern } from "@app/interface/gameRecord";

// 記録中の試合を各ページで参照するための localStorage キー。
export const GAME_RESULT_ID_STORAGE_KEY = "gameResultId";

// 記録パターンを試合情報入力 → 打撃ページ間で受け渡すための localStorage キー。
export const RECORD_PATTERN_STORAGE_KEY = "recordPattern";

// 既存試合の編集として試合情報入力画面へ入ったことを示す localStorage キー。
// 新規記録フロー（保存して戻った場合を含む）と区別するために使う。
export const GAME_RECORD_EDIT_MODE_STORAGE_KEY = "gameRecordEditMode";

// 記録フローが localStorage に持つ一時状態の全キー。
// フロー離脱時はここを一括で破棄し、次回の記録に前回の状態が漏れないようにする。
export const GAME_RECORD_STORAGE_KEYS = [
  GAME_RESULT_ID_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
] as const;

// 記録パターン選択ボタンの定義。「打撃・投手記録を入力(both)」を推奨として
// primary(塗りつぶし)、片方のみは outlined(枠線)で視覚的に階層化する。
export const RECORD_PATTERN_OPTIONS: ReadonlyArray<{
  pattern: RecordPattern;
  label: string;
  emphasis: "primary" | "outlined";
}> = [
  { pattern: "batting", label: "打撃結果のみ入力", emphasis: "outlined" },
  { pattern: "pitching", label: "投手結果のみ入力", emphasis: "outlined" },
  { pattern: "both", label: "打撃・投手記録を入力", emphasis: "primary" },
];
