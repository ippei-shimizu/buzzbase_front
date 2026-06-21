"use client";
import type { SeasonData, TournamentData } from "@app/interface";
import { useEffect, useState } from "react";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { getSeasons } from "@app/services/seasonsService";
import { getTournaments } from "@app/services/tournamentsService";
import { getCurrentUserId } from "@app/services/userService";
import {
  type AdditionalStats,
  type AnalysisFilters as Filters,
  getAdditionalStats,
  getHeadlineStats,
  getHitDirections,
  getHitLocations,
  getRunnersSituation,
  type HeadlineStats,
  type HitDirectionData,
  type HitLocationData,
  type RunnersSituationSummary,
} from "../../analysisActions";
import { AdditionalStatsCard } from "./AdditionalStatsCard";
import { AnalysisFilters } from "./AnalysisFilters";
import { HeadlineStatsCard } from "./HeadlineStatsCard";
import { HitDirectionTable } from "./HitDirectionTable";
import { RunnersSituationCard } from "./RunnersSituationCard";
import { SprayChart } from "./SprayChart";

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

/** 打撃成績分析（基本指標 + 打球チャート + 打球方向）のコンテナ。 */
export function AnalysisContainer() {
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [headline, setHeadline] = useState<HeadlineStats | null>(null);
  const [runnersSituation, setRunnersSituation] =
    useState<RunnersSituationSummary | null>(null);
  const [additional, setAdditional] = useState<AdditionalStats | null>(null);
  const [hitLocations, setHitLocations] = useState<HitLocationData>({
    points: [],
  });
  const [hitDirections, setHitDirections] = useState<HitDirectionData>({
    directions: [],
    home_runs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [seasonOptions, setSeasonOptions] = useState<FilterOption[]>([
    DEFAULT_OPTION,
  ]);
  const [tournamentOptions, setTournamentOptions] = useState<FilterOption[]>([
    DEFAULT_OPTION,
  ]);
  const yearOptions = buildYearOptions();

  useEffect(() => {
    let active = true;
    (async () => {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    Promise.all([
      getHeadlineStats(filters),
      getRunnersSituation(filters),
      getAdditionalStats(filters),
      getHitLocations(filters),
      getHitDirections(filters),
    ]).then(
      ([headlineData, runnersData, additionalData, locations, directions]) => {
        if (!active) return;
        setHeadline(headlineData);
        setRunnersSituation(runnersData);
        setAdditional(additionalData);
        setHitLocations(locations);
        setHitDirections(directions);
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div className="flex flex-col gap-y-5">
      <AnalysisFilters
        filters={filters}
        onChange={setFilters}
        yearOptions={yearOptions}
        seasonOptions={seasonOptions}
        tournamentOptions={tournamentOptions}
      />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <HeadlineStatsCard stats={headline} />
          <RunnersSituationCard stats={runnersSituation} />
          <AdditionalStatsCard stats={additional} />
          <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
            <h3 className="text-sm font-bold">打球チャート</h3>
            <SprayChart points={hitLocations.points} />
          </section>
          <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
            <h3 className="text-sm font-bold">打球方向</h3>
            <HitDirectionTable directions={hitDirections.directions} />
          </section>
        </>
      )}
    </div>
  );
}
