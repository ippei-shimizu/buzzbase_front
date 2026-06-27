// 試合結果サマリー（GET /api/v2/stats/game_summary）の型。
// server（gameSummaryActions.ts）/ client（各 Presentational）双方から import するため、
// next/headers 等のサーバー専用 API は持たせない。mobile types/stats.ts と同一構造。

export interface WinLossSummary {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  /** 勝率（0.0〜1.0、小数3桁）。 */
  win_rate: number;
}

export interface Scoring {
  runs_for: number;
  runs_against: number;
  run_differential: number;
  avg_runs_for: number;
  avg_runs_against: number;
}

export interface RecentFormGame {
  game_result_id: number;
  /** "MM/dd" 形式（年なし）。 */
  date: string;
  /** "regular" / "open" / null。 */
  match_type: string | null;
  opponent: string;
  result: "win" | "loss" | "draw";
  my_score: number;
  opponent_score: number;
}

export interface MonthlyGame {
  /** 1〜12。 */
  month: number;
  count: number;
}

export interface OpponentRecord {
  team_name: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
}

export interface GameSummary {
  win_loss: WinLossSummary;
  scoring: Scoring;
  recent_form: RecentFormGame[];
  monthly_games: MonthlyGame[];
  opponent_records: OpponentRecord[];
}

/** サマリーの絞り込み条件。自分の試合一覧画面なので user_id は扱わない（current_user にフォールバック）。 */
export interface GameSummaryFilters {
  year?: string;
  /** "regular" / "open"（空文字は未絞り込み）。 */
  matchType?: string;
  seasonId?: string;
  tournamentId?: string;
}

/**
 * Server Action の戻り値。403（非公開アカウント）と未認証・その他失敗を
 * UI 側で区別できるよう判別ユニオンにする。
 */
export type GameSummaryResult =
  | { status: "ok"; data: GameSummary }
  | { status: "forbidden" }
  | { status: "unauthenticated" }
  | { status: "error" };
