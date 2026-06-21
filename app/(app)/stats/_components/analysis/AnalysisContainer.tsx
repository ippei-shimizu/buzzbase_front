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
  type BattingTrendData,
  type BattingTrendGranularity,
  getAdditionalStats,
  getBattingTrend,
  getHeadlineStats,
  getHitDirections,
  getHitLocations,
  getPlateAppearanceBreakdown,
  getRunnersSituation,
  type HeadlineStats,
  type HitDirectionData,
  type HitLocationData,
  type PlateAppearanceCategory,
  type RunnersSituationSummary,
} from "../../analysisActions";
import { AdditionalStatsCard } from "./AdditionalStatsCard";
import { AnalysisFilters } from "./AnalysisFilters";
import { BattingTrendChart } from "./BattingTrendChart";
import { HeadlineStatsCard } from "./HeadlineStatsCard";
import { HitDirectionTable } from "./HitDirectionTable";
import { PlateAppearanceDonut } from "./PlateAppearanceDonut";
import { RunnersSituationCard } from "./RunnersSituationCard";
import { SprayChart, type SprayChartMode } from "./SprayChart";

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
  const [plateBreakdown, setPlateBreakdown] = useState<
    PlateAppearanceCategory[]
  >([]);
  const [granularity, setGranularity] =
    useState<BattingTrendGranularity>("game");
  const [sprayChartMode, setSprayChartMode] =
    useState<SprayChartMode>("scatter");
  const [battingTrend, setBattingTrend] = useState<BattingTrendData>({
    granularity: "game",
    points: [],
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
      getPlateAppearanceBreakdown(filters),
    ]).then(
      ([
        headlineData,
        runnersData,
        additionalData,
        locations,
        directions,
        breakdown,
      ]) => {
        if (!active) return;
        setHeadline(headlineData);
        setRunnersSituation(runnersData);
        setAdditional(additionalData);
        setHitLocations(locations);
        setHitDirections(directions);
        setPlateBreakdown(breakdown);
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [filters]);

  // 推移グラフは粒度切替で独立に再取得する（他カードは再取得しない）。
  useEffect(() => {
    let active = true;
    getBattingTrend(filters, granularity).then((data) => {
      if (active) setBattingTrend(data);
    });
    return () => {
      active = false;
    };
  }, [filters, granularity]);

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
          <BattingTrendChart
            points={battingTrend.points}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
          <SprayChart
            directions={hitDirections.directions}
            homeRuns={hitDirections.home_runs}
            points={hitLocations.points}
            mode={sprayChartMode}
            onModeChange={setSprayChartMode}
          />
          <HitDirectionTable directions={hitDirections.directions} />
          <PlateAppearanceDonut
            breakdown={plateBreakdown}
            totalPlateAppearances={plateBreakdown.reduce(
              (sum, category) => sum + category.count,
              0,
            )}
          />
        </>
      )}
    </div>
  );
}
