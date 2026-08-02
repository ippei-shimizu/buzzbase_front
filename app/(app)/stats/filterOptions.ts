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
 * 成績画面のフィルタ選択肢（シーズン / 大会 / 記録のある年月）をサーバーで取得する。
 * `cache()` でラップしているため、同一リクエスト内で page / 各 Section から
 * 複数回呼ばれても実取得は1回（seasons + tournaments + months の3コール）に集約される。
 * 認証ヘッダがあれば user_id は不要（バックエンドが current_user にフォールバック）。
 *
 * 大会は全大会ではなく自分の試合に紐づくものだけを返す（選んでも0件になる候補を出さないため）。
 */
export const getStatsFilterOptions = cache(
  async (): Promise<StatsFilterOptions> => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return emptyOptions();

      const [seasonsResponse, tournamentsResponse, monthsResponse] =
        await Promise.all([
          fetch(`${RAILS_API_URL}/api/v1/seasons`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${RAILS_API_URL}/api/v1/tournaments/user_tournaments`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${RAILS_API_URL}/api/v1/match_results/available_months`, {
            headers,
            cache: "no-store",
          }),
        ]);

      const seasons: SeasonData[] = seasonsResponse.ok
        ? await seasonsResponse.json()
        : [];
      const tournaments: TournamentData[] = tournamentsResponse.ok
        ? await tournamentsResponse.json()
        : [];
      const months: string[] = monthsResponse.ok
        ? await monthsResponse.json()
        : [];

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
