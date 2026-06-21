"use client";
import type { SeasonData, TournamentData } from "@app/interface";
import { useEffect, useState } from "react";
import { getSeasons } from "@app/services/seasonsService";
import { getTournaments } from "@app/services/tournamentsService";
import { getCurrentUserId } from "@app/services/userService";
import {
  type AnalysisFilters as Filters,
  type EraTrendPoint,
  getEraTrend,
} from "../../analysisActions";
import { AnalysisFilters } from "./AnalysisFilters";
import { EraTrendChart } from "./EraTrendChart";

interface FilterOption {
  key: string;
  label: string;
}

const DEFAULT_OPTION: FilterOption = { key: "全て", label: "全て" };

function buildYearOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption[] = [{ key: "通算", label: "通算" }];
  for (let offset = 0; offset < 6; offset += 1) {
    const year = String(currentYear - offset);
    options.push({ key: year, label: year });
  }
  return options;
}

/** 投手タブの分析（フィルタ + 防御率推移グラフ）コンテナ。 */
export function PitchingAnalysisContainer() {
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [eraTrend, setEraTrend] = useState<EraTrendPoint[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<FilterOption[]>([
    DEFAULT_OPTION,
  ]);
  const [tournamentOptions, setTournamentOptions] = useState<FilterOption[]>([
    DEFAULT_OPTION,
  ]);
  const [yearOptions] = useState(buildYearOptions);

  useEffect(() => {
    let active = true;
    void (async () => {
      const userId = await getCurrentUserId();
      const [seasons, tournaments] = await Promise.all([
        getSeasons(userId ?? undefined),
        getTournaments() as Promise<TournamentData[]>,
      ]);
      if (!active) return;
      setSeasonOptions([
        DEFAULT_OPTION,
        ...seasons.map((season: SeasonData) => ({
          key: String(season.id),
          label: season.name,
        })),
      ]);
      setTournamentOptions([
        DEFAULT_OPTION,
        ...tournaments.map((tournament) => ({
          key: String(tournament.id),
          label: tournament.name,
        })),
      ]);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    // 防御率推移は year/season/tournament のみで絞る（種別は対象外）。
    void getEraTrend({
      year: filters.year,
      seasonId: filters.seasonId,
      tournamentId: filters.tournamentId,
    }).then((trend) => {
      if (active) setEraTrend(trend);
    });
    return () => {
      active = false;
    };
  }, [filters.year, filters.seasonId, filters.tournamentId]);

  return (
    <div className="flex flex-col gap-y-5">
      <AnalysisFilters
        filters={filters}
        onChange={setFilters}
        yearOptions={yearOptions}
        seasonOptions={seasonOptions}
        tournamentOptions={tournamentOptions}
      />
      <EraTrendChart data={eraTrend} />
    </div>
  );
}
