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

/** 絞り込みが1つでも効いているか（リセットボタンの表示判定に使う）。 */
export function hasActiveFilter(values: FilterValues): boolean {
  return Object.values(values).some((value) => Boolean(value));
}
