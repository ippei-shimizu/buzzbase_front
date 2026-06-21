"use client";
import type { FilterOption } from "../../filterOptions";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  type AnalysisFilters as Filters,
  type AnalysisInitialData,
  type BattingTrendGranularity,
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
  type PitchTypeData,
  type PitcherFaceoffData,
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
import { ProComingSoonCard } from "./ProComingSoonCard";
import {
  CountSituationDummy,
  PitcherFaceoffDummy,
  PitchTypeDummy,
} from "./ProComingSoonDummies";
import { ProComingSoonHitDirectionField } from "./ProComingSoonHitDirectionField";
import { RunnersSituationCard } from "./RunnersSituationCard";
import { SprayChart, type SprayChartMode } from "./SprayChart";
import { TimingCard } from "./TimingCard";

// Pro プラン機能のリリース前は coming soon 表示にする（mobile と同じ運用）。
const PRO_FEATURES_COMING_SOON: boolean = true;

function buildYearOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption[] = [{ key: "通算", label: "通算" }];
  for (let offset = 0; offset < 6; offset += 1) {
    const year = String(currentYear - offset);
    options.push({ key: year, label: year });
  }
  return options;
}

interface AnalysisContainerProps {
  /** SSR で取得した初期表示データ。マウント時はこれを使い再取得しない。 */
  initialData: AnalysisInitialData;
  /** サーバーで取得したシーズン/大会のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
}

/** 打撃成績分析（基本指標 + 打球チャート + 打球方向）のコンテナ。 */
export function AnalysisContainer({
  initialData,
  seasonOptions,
  tournamentOptions,
}: AnalysisContainerProps) {
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [headline, setHeadline] = useState(initialData.headline);
  const [runnersSituation, setRunnersSituation] = useState(
    initialData.runnersSituation,
  );
  const [additional, setAdditional] = useState(initialData.additional);
  const [hitLocations, setHitLocations] = useState(initialData.hitLocations);
  const [hitDirections, setHitDirections] = useState(initialData.hitDirections);
  const [plateBreakdown, setPlateBreakdown] = useState(
    initialData.plateBreakdown,
  );
  const [contactQualities, setContactQualities] = useState(
    initialData.contactQualities,
  );
  const [timingBreakdown, setTimingBreakdown] = useState(
    initialData.timingBreakdown,
  );
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
  const [pitcherAttributes, setPitcherAttributes] = useState(
    initialData.pitcherAttributes,
  );
  const [granularity, setGranularity] =
    useState<BattingTrendGranularity>("game");
  const [sprayChartMode, setSprayChartMode] =
    useState<SprayChartMode>("scatter");
  const [battingTrend, setBattingTrend] = useState(initialData.battingTrend);
  const [isRefetching, startRefetch] = useTransition();
  // 推移グラフは粒度切替で単独再取得もあるため、専用の pending でグラフだけ dim する。
  const [isTrendPending, startTrendTransition] = useTransition();
  const [yearOptions] = useState(buildYearOptions);

  // 初回は SSR の initialData を使うため再取得しない（フィルタ変更時のみ取得）。
  const didInitRef = useRef(false);
  const didInitTrendRef = useRef(false);

  // フィルタ変更時のみ、メイン指標と打球詳細系（coming soon ゲートの3種を除く）を
  // まとめて再取得する。useTransition の isPending でカードを薄く表示する。
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    let active = true;
    startRefetch(async () => {
      const [
        headlineData,
        runnersData,
        additionalData,
        locations,
        directions,
        breakdown,
        contact,
        timing,
        attributes,
      ] = await Promise.all([
        getHeadlineStats(filters),
        getRunnersSituation(filters),
        getAdditionalStats(filters),
        getHitLocations(filters),
        getHitDirections(filters),
        getPlateAppearanceBreakdown(filters),
        getContactQualities(filters),
        getTimingBreakdown(filters),
        getPitcherAttributeSummary(filters),
      ]);
      if (!active) return;
      setHeadline(headlineData);
      setRunnersSituation(runnersData);
      setAdditional(additionalData);
      setHitLocations(locations);
      setHitDirections(directions);
      setPlateBreakdown(breakdown);
      setContactQualities(contact);
      setTimingBreakdown(timing);
      setPitcherAttributes(attributes);
    });
    return () => {
      active = false;
    };
  }, [filters, startRefetch]);

  // coming soon でゲートする3種は SSR せず、解禁時のみクライアントで取得する。
  useEffect(() => {
    if (PRO_FEATURES_COMING_SOON) return;
    let active = true;
    Promise.all([
      getCountSituations(filters),
      getPitchTypes(filters),
      getPitcherFaceoffs(filters),
    ]).then(([counts, pitches, faceoffs]) => {
      if (!active) return;
      setCountSituations(counts);
      setPitchTypes(pitches);
      setPitcherFaceoffs(faceoffs);
    });
    return () => {
      active = false;
    };
  }, [filters]);

  // 推移グラフは粒度/フィルタ切替で独立に再取得する（初回は initialData を使う）。
  // 専用 transition で更新が終わるまでグラフを dim し、古い値が一瞬出るのを防ぐ。
  useEffect(() => {
    if (!didInitTrendRef.current) {
      didInitTrendRef.current = true;
      return;
    }
    let active = true;
    startTrendTransition(async () => {
      const data = await getBattingTrend(filters, granularity);
      if (active) setBattingTrend(data);
    });
    return () => {
      active = false;
    };
  }, [filters, granularity, startTrendTransition]);

  return (
    <div className="flex flex-col gap-y-5">
      <AnalysisFilters
        filters={filters}
        onChange={setFilters}
        yearOptions={yearOptions}
        seasonOptions={seasonOptions}
        tournamentOptions={tournamentOptions}
      />
      <div
        className={`flex flex-col gap-y-5${
          isRefetching ? " opacity-50 transition-opacity" : ""
        }`}
      >
        <HeadlineStatsCard stats={headline} />
        <RunnersSituationCard stats={runnersSituation} />
        <AdditionalStatsCard stats={additional} />
        <div
          className={
            isTrendPending ? "opacity-50 transition-opacity" : undefined
          }
        >
          <BattingTrendChart
            points={battingTrend.points}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>
        <SprayChart
          directions={hitDirections.directions}
          homeRuns={hitDirections.home_runs}
          points={hitLocations.points}
          mode={sprayChartMode}
          onModeChange={setSprayChartMode}
        />
        {PRO_FEATURES_COMING_SOON ? (
          <ProComingSoonCard
            title="方向別の打率"
            description="打球を打った方向ごとの打率をヒートマップで可視化します"
          >
            <ProComingSoonHitDirectionField />
          </ProComingSoonCard>
        ) : (
          <HitDirectionTable directions={hitDirections.directions} />
        )}
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
        {PRO_FEATURES_COMING_SOON ? (
          <ProComingSoonCard
            title="カウント別の打率"
            description="初球・有利カウント・追い込みなど、カウント状況別の打率がわかります"
          >
            <CountSituationDummy />
          </ProComingSoonCard>
        ) : (
          <CountSituationCards data={countSituations} />
        )}
        {PRO_FEATURES_COMING_SOON ? (
          <ProComingSoonCard
            title="球種別の打率"
            description="ストレートや変化球など、球種ごとの得意・苦手が分析できます"
          >
            <PitchTypeDummy />
          </ProComingSoonCard>
        ) : (
          <PitchTypeCard
            rows={pitchTypes.rows}
            totalTargetPa={pitchTypes.total_target_pa}
          />
        )}
        {PRO_FEATURES_COMING_SOON ? (
          <ProComingSoonCard
            title="対戦投手別"
            description="対戦した投手ごとの打撃成績を一覧で確認できます"
          >
            <PitcherFaceoffDummy />
          </ProComingSoonCard>
        ) : (
          <PitcherFaceoffList
            rows={pitcherFaceoffs.rows}
            minPlateAppearances={pitcherFaceoffs.min_plate_appearances}
            totalTargetPa={pitcherFaceoffs.total_target_pa}
          />
        )}
        <PitcherAttributeSummary data={pitcherAttributes} />
      </div>
    </div>
  );
}
