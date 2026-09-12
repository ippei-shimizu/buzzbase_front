// v2 ダッシュボード成績 API（GET /api/v2/dashboard/batting_stats・pitching_stats）の
// レスポンス型。ダッシュボードとマイページ成績タブで共有する。
//
// バックエンドは「集計値（aggregate）」と「計算済み指標（calculated）」を分けて返す。
// 打率・防御率・OPS などの率系はすべて calculated 側が保持しているため、
// フロントで再計算してはならない（イニング制の重み付け等をバックエンドが持っている）。

export interface BattingStatsAggregate {
  number_of_matches: number;
  hit: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
  runs_batted_in: number;
  run: number;
  stealing_base: number;
  caught_stealing: number;
  times_at_bat: number;
  at_bats: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  strike_out: number;
  error: number;
}

export interface BattingStatsCalculated {
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  iso: number;
  bb_per_k: number;
  isod: number;
}

/** 記録が 1 件も無い（または全て 0）の場合、バックエンドは両方 null を返す。 */
export interface BattingStats {
  aggregate: BattingStatsAggregate | null;
  calculated: BattingStatsCalculated | null;
}

export interface PitchingStatsAggregate {
  number_of_appearances: number;
  win: number;
  loss: number;
  complete_games: number;
  shutouts: number;
  saves: number;
  hold: number;
  innings_pitched: number;
  hits_allowed: number;
  home_runs_hit: number;
  strikeouts: number;
  base_on_balls: number;
  hit_by_pitch: number;
  run_allowed: number;
  earned_run: number;
  number_of_pitches: number;
}

export interface PitchingStatsCalculated {
  era: number;
  win_percentage: number;
  whip: number;
  k_per_nine: number;
  bb_per_nine: number;
  k_bb: number;
}

export interface PitchingStats {
  aggregate: PitchingStatsAggregate | null;
  calculated: PitchingStatsCalculated | null;
}

/**
 * 成績取得の結果。「非公開（403）」「取得失敗」「成績 0 件」を UI が区別できるようにする。
 *
 * 取得に失敗した状態で 0 を描画すると「0 打数 0 安打」という誤った成績を
 * 見せてしまうため、失敗は必ず `error` / `forbidden` として伝える。
 * 成績が本当に 0 件のケースは `ok` かつ `aggregate` / `calculated` が null になる。
 */
export type StatsFetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "error" };
