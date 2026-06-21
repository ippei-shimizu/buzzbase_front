import type { SeasonData, TournamentData } from "@app/interface";
import { cache } from "react";
import { getAuthHeaders } from "@app/services/v2/authHeaders";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";
import { DEFAULT_OPTION, type FilterOption } from "./statsFilterOption";

export interface StatsFilterOptions {
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
}

// cache() で同一結果を共有するため、フォールバックは呼び出しごとに新規配列を返す。
const emptyOptions = (): StatsFilterOptions => ({
  seasonOptions: [DEFAULT_OPTION],
  tournamentOptions: [DEFAULT_OPTION],
});

/**
 * 成績画面のフィルタ選択肢（シーズン / 大会）をサーバーで取得する。
 * `cache()` でラップしているため、同一リクエスト内で page / 各 Section から
 * 複数回呼ばれても実取得は1回（seasons + tournaments の2コール）に集約される。
 * 認証ヘッダがあれば user_id は不要（バックエンドが current_user にフォールバック）。
 */
export const getStatsFilterOptions = cache(
  async (): Promise<StatsFilterOptions> => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return emptyOptions();

      const [seasonsResponse, tournamentsResponse] = await Promise.all([
        fetch(`${RAILS_API_URL}/api/v1/seasons`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${RAILS_API_URL}/api/v1/tournaments`, {
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

      return {
        seasonOptions: [
          DEFAULT_OPTION,
          ...seasons.map((season) => ({
            key: String(season.id),
            label: season.name,
          })),
        ],
        tournamentOptions: [
          DEFAULT_OPTION,
          ...tournaments.map((tournament) => ({
            key: String(tournament.id),
            label: tournament.name,
          })),
        ],
      };
    } catch (error) {
      captureServerActionError(error, { action: "getStatsFilterOptions" });
      return emptyOptions();
    }
  },
);
