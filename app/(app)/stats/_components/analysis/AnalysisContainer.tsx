"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import {
  type AdditionalStats,
  type AnalysisFilters as Filters,
  type BattingTrendData,
  type BreakdownData,
  type CountSituations,
  getAdditionalStats,
  getBattingTrend,
  getContactQualityStats,
  getCountSituations,
  getHeadlineStats,
  getHitDirections,
  getHitLocations,
  getOutTypeBreakdown,
  getPitcherFaceoffs,
  getPitchTypeStats,
  getRunnersSituation,
  getTimingBreakdown,
  type HeadlineStats,
  type HitDirectionData,
  type HitLocationData,
  type PitcherFaceoffData,
  type PitchTypeData,
  type RunnersSituationSummary,
} from "../../analysisActions";
import { AdditionalStatsCard } from "./AdditionalStatsCard";
import { AnalysisFilters } from "./AnalysisFilters";
import { BattingTrendChart } from "./BattingTrendChart";
import {
  ContactQualityCard,
  CountSituationCards,
  OutTypeCard,
  RunnersSituationCard,
  TimingCard,
} from "./DetailCards";
import { HeadlineStatsCard } from "./HeadlineStatsCard";
import { HitDirectionTable } from "./HitDirectionTable";
import { PitcherFaceoffList } from "./PitcherFaceoffList";
import { PitchTypeCard } from "./PitchTypeCard";
import { SprayChart } from "./SprayChart";

function buildYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years = ["通算"];
  for (let offset = 0; offset < 6; offset += 1) {
    years.push(String(currentYear - offset));
  }
  return years;
}

/** 打撃成績分析（基本指標 + 打球チャート + 打球方向）のコンテナ。 */
export function AnalysisContainer() {
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [headline, setHeadline] = useState<HeadlineStats | null>(null);
  const [additional, setAdditional] = useState<AdditionalStats | null>(null);
  const [hitLocations, setHitLocations] = useState<HitLocationData>({
    points: [],
  });
  const [hitDirections, setHitDirections] = useState<HitDirectionData>({
    directions: [],
    home_runs: [],
  });
  const [contactQuality, setContactQuality] = useState<BreakdownData>({
    breakdown: [],
    total: 0,
  });
  const [timing, setTiming] = useState<BreakdownData>({
    breakdown: [],
    total: 0,
  });
  const [outType, setOutType] = useState<BreakdownData>({
    breakdown: [],
    total: 0,
  });
  const [countSituations, setCountSituations] =
    useState<CountSituations | null>(null);
  const [runners, setRunners] = useState<RunnersSituationSummary | null>(null);
  const [pitchType, setPitchType] = useState<PitchTypeData>({
    rows: [],
    total_target_pa: 0,
  });
  const [pitcherFaceoffs, setPitcherFaceoffs] = useState<PitcherFaceoffData>({
    rows: [],
    total_target_pa: 0,
    min_plate_appearances: 0,
  });
  const [battingTrend, setBattingTrend] = useState<BattingTrendData>({
    granularity: "game",
    points: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const years = buildYears();

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    Promise.all([
      getHeadlineStats(filters),
      getAdditionalStats(filters),
      getHitLocations(filters),
      getHitDirections(filters),
      getContactQualityStats(filters),
      getTimingBreakdown(filters),
      getOutTypeBreakdown(filters),
      getCountSituations(filters),
      getRunnersSituation(filters),
      getPitchTypeStats(filters),
      getPitcherFaceoffs(filters),
      getBattingTrend(filters),
    ]).then(
      ([
        headlineData,
        additionalData,
        locations,
        directions,
        contactQualityData,
        timingData,
        outTypeData,
        countData,
        runnersData,
        pitchTypeData,
        faceoffData,
        trendData,
      ]) => {
        if (!active) return;
        setHeadline(headlineData);
        setAdditional(additionalData);
        setHitLocations(locations);
        setHitDirections(directions);
        setContactQuality(contactQualityData);
        setTiming(timingData);
        setOutType(outTypeData);
        setCountSituations(countData);
        setRunners(runnersData);
        setPitchType(pitchTypeData);
        setPitcherFaceoffs(faceoffData);
        setBattingTrend(trendData);
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div className="flex flex-col gap-y-5">
      <AnalysisFilters filters={filters} onChange={setFilters} years={years} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <HeadlineStatsCard stats={headline} />
          <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
            <h3 className="text-sm font-bold">打球チャート</h3>
            <SprayChart points={hitLocations.points} />
          </section>
          <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
            <h3 className="text-sm font-bold">打球方向</h3>
            <HitDirectionTable directions={hitDirections.directions} />
          </section>
          <CountSituationCards
            data={
              countSituations ?? {
                first_pitch: { at_bats: 0, hits: 0, batting_average: 0 },
                favorable_count: { at_bats: 0, hits: 0, batting_average: 0 },
                pinch_count: { at_bats: 0, hits: 0, batting_average: 0 },
                total_target_pa: 0,
              }
            }
          />
          <RunnersSituationCard
            data={
              runners ?? {
                batting_average: 0,
                at_bats: 0,
                hits: 0,
                two_base_hit: 0,
                three_base_hit: 0,
                home_run: 0,
              }
            }
          />
          <ContactQualityCard data={contactQuality} />
          <TimingCard data={timing} />
          <OutTypeCard data={outType} />
          <PitchTypeCard data={pitchType} />
          <PitcherFaceoffList data={pitcherFaceoffs} />
          <BattingTrendChart data={battingTrend} />
          <AdditionalStatsCard stats={additional} />
        </>
      )}
    </div>
  );
}
