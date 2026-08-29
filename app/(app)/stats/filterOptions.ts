import type { FilterOption } from "@app/components/filter/filterTypes";
import type { SeasonData, TournamentData } from "@app/interface";
import { cache } from "react";
import { monthOptionsFromRecorded } from "@app/components/filter/monthOptions";
import { getAuthHeaders } from "@app/services/v2/authHeaders";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";

export interface StatsFilterOptions {
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
  /** 記録のある年月だけの選択肢（新しい順）。 */
  monthOptions: FilterOption[];
}

// cache() で同一結果を共有するため、フォールバックは呼び出しごとに新規配列を返す。
const emptyOptions = (): StatsFilterOptions => ({
  seasonOptions: [],
  tournamentOptions: [],
  monthOptions: [],
});

/**
 * 選択肢1種類ぶんを取得する。1本の失敗で他のチップまで消えないよう、
 * 失敗（例外 / 非 2xx）はこの関数内で空配列に畳んで呼び出し側には伝播させない。
 */
async function fetchOptionSource<T>(
  path: string,
  headers: Record<string, string>,
  action: string,
): Promise<T[]> {
  try {
    const response = await fetch(`${RAILS_API_URL}${path}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return [];
    return (await response.json()) as T[];
  } catch (error) {
    captureServerActionError(error, { action });
    return [];
  }
}

/**
 * 成績画面のフィルタ選択肢（シーズン / 大会 / 記録のある年月）をサーバーで取得する。
 * `cache()` でラップしているため、同一リクエスト内で page / 各 Section から
 * 複数回呼ばれても実取得は1回（seasons + tournaments + months の3コール）に集約される。
 * 認証ヘッダがあれば user_id は不要（バックエンドが current_user にフォールバック）。
 *
 * 大会は全大会ではなく自分の試合に紐づくものだけを返す（選んでも0件になる候補を出さないため）。
 * 3本は互いに独立して縮退するため、1本落ちても残りのチップは出せる。
 */
export const getStatsFilterOptions = cache(
  async (): Promise<StatsFilterOptions> => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return emptyOptions();

      const [seasons, tournaments, months] = await Promise.all([
        fetchOptionSource<SeasonData>(
          "/api/v1/seasons",
          headers,
          "getStatsFilterOptions:seasons",
        ),
        fetchOptionSource<TournamentData>(
          "/api/v1/tournaments/user_tournaments",
          headers,
          "getStatsFilterOptions:tournaments",
        ),
        fetchOptionSource<string>(
          "/api/v1/match_results/available_months",
          headers,
          "getStatsFilterOptions:months",
        ),
      ]);

      return {
        seasonOptions: seasons.map((season) => ({
          key: String(season.id),
          label: season.name,
        })),
        tournamentOptions: tournaments.map((tournament) => ({
          key: String(tournament.id),
          label: tournament.name,
        })),
        monthOptions: monthOptionsFromRecorded(months),
      };
    } catch (error) {
      captureServerActionError(error, { action: "getStatsFilterOptions" });
      return emptyOptions();
    }
  },
);
