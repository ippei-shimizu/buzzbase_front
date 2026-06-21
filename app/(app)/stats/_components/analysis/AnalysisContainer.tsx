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
  type ContactQualityData,
  type CountSituations,
  getAdditionalStats,
  getBattingTrend,
  getContactQualities,
  getCountSituations,
  getHeadlineStats,
  getHitDirections,
  getHitLocations,
  getPitcherAttributeSummary,
  getPitcherFaceoffs,
  getPitchTypes,
  getPlateAppearanceBreakdown,
  getRunnersSituation,
  getTimingBreakdown,
  type HeadlineStats,
  type HitDirectionData,
  type HitLocationData,
  type PitchTypeData,
  type PitcherAttributeSummaryData,
  type PitcherFaceoffData,
  type PlateAppearanceCategory,
  type RunnersSituationSummary,
  type TimingBreakdownData,
} from "../../analysisActions";
import { AdditionalStatsCard } from "./AdditionalStatsCard";
import { AnalysisFilters } from "./AnalysisFilters";
import { BattingTrendChart } from "./BattingTrendChart";
import { ContactQualityCard } from "./ContactQualityCard";
import { CountSituationCards } from "./CountSituationCards";
import { HeadlineStatsCard } from "./HeadlineStatsCard";
import { HitDirectionTable } from "./HitDirectionTable";
import { PitcherAttributeSummary } from "./PitcherAttributeSummary";
import { PitcherFaceoffList } from "./PitcherFaceoffList";
import { PitchTypeCard } from "./PitchTypeCard";
import { PlateAppearanceDonut } from "./PlateAppearanceDonut";
import { RunnersSituationCard } from "./RunnersSituationCard";
import { SprayChart, type SprayChartMode } from "./SprayChart";
import { TimingCard } from "./TimingCard";

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
  const [contactQualities, setContactQualities] = useState<ContactQualityData>({
    breakdown: [],
    total: 0,
  });
  const [timingBreakdown, setTimingBreakdown] = useState<TimingBreakdownData>({
    breakdown: [],
    total: 0,
  });
  const [countSituations, setCountSituations] = useState<CountSituations>({
    first_pitch: { at_bats: 0, hits: 0, batting_average: 0 },
    favorable_count: { at_bats: 0, hits: 0, batting_average: 0 },
    pinch_count: { at_bats: 0, hits: 0, batting_average: 0 },
    total_target_pa: 0,
  });
  const [pitchTypes, setPitchTypes] = useState<PitchTypeData>({
    rows: [],
    total_target_pa: 0,
  });
  const [pitcherFaceoffs, setPitcherFaceoffs] = useState<PitcherFaceoffData>({
    rows: [],
    min_plate_appearances: 0,
    total_target_pa: 0,
  });
  const [pitcherAttributes, setPitcherAttributes] =
    useState<PitcherAttributeSummaryData | null>(null);
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

  // 投手・打球詳細系のカードはメインのローディングを止めずに並列取得する。
  useEffect(() => {
    let active = true;
    Promise.all([
      getContactQualities(filters),
      getTimingBreakdown(filters),
      getCountSituations(filters),
      getPitchTypes(filters),
      getPitcherFaceoffs(filters),
      getPitcherAttributeSummary(filters),
    ]).then(([contact, timing, counts, pitches, faceoffs, attributes]) => {
      if (!active) return;
      setContactQualities(contact);
      setTimingBreakdown(timing);
      setCountSituations(counts);
      setPitchTypes(pitches);
      setPitcherFaceoffs(faceoffs);
      setPitcherAttributes(attributes);
    });
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
          <ContactQualityCard
            breakdown={contactQualities.breakdown}
            total={contactQualities.total}
          />
          <TimingCard
            breakdown={timingBreakdown.breakdown}
            total={timingBreakdown.total}
          />
          <CountSituationCards data={countSituations} />
          <PitchTypeCard
            rows={pitchTypes.rows}
            totalTargetPa={pitchTypes.total_target_pa}
          />
          <PitcherFaceoffList
            rows={pitcherFaceoffs.rows}
            minPlateAppearances={pitcherFaceoffs.min_plate_appearances}
            totalTargetPa={pitcherFaceoffs.total_target_pa}
          />
          <PitcherAttributeSummary data={pitcherAttributes} />
        </>
      )}
    </div>
  );
}
