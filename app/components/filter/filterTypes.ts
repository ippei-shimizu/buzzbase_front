// 成績・試合一覧・グループ詳細で共有する絞り込みの型と定数。
// server / client の双方から import するため、next/headers 等のサーバー専用 API は持たせない。

export interface FilterOption {
  key: string;
  label: string;
}

/**
 * 絞り込みの値。すべて未指定（undefined）が「絞り込まない」を表す。
 * バックエンドの year / match_type / season_id / tournament_id / start_month / end_month に対応する。
 */
export interface FilterValues {
  /** 西暦4桁。未指定は通算。 */
  year?: string;
  /** "regular" / "open"。 */
  matchType?: string;
  seasonId?: string;
  tournamentId?: string;
  /** 期間の開始年月 "YYYY-MM"（開放端可）。 */
  startMonth?: string;
  /** 期間の終了年月 "YYYY-MM"（開放端可）。 */
  endMonth?: string;
}

/**
 * 「絞り込まない」を表すチップの選択キー。実データ由来のキー（年・ID・"YYYY-MM"）と
 * 衝突しない値にしている。
 */
export const ALL_FILTER_KEY = "__all__";

export const FILTER_KEYS = [
  "year",
  "matchType",
  "seasonId",
  "tournamentId",
  "startMonth",
  "endMonth",
] as const satisfies readonly (keyof FilterValues)[];

/**
 * 絞り込みが基準値から動いているか（リセットボタンの表示判定に使う）。
 *
 * 画面によっては「絞り込み無し」が `{}` ではないため（例: 成績の月/日表示は
 * 当年で絞った状態が既定）、基準値を渡せるようにしている。
 *
 * @param values 現在の絞り込み値
 * @param baseline 絞り込み無しとみなす値。既定は全解除（`{}`）
 */
export function hasActiveFilter(
  values: FilterValues,
  baseline: FilterValues = {},
): boolean {
  return FILTER_KEYS.some(
    (key) => (values[key] || undefined) !== (baseline[key] || undefined),
  );
}
