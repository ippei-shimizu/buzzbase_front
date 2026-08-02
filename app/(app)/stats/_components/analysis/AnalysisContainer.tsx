"use client";
import type { FilterOption } from "../../statsFilterOption";
import type { ProFeature } from "@app/types/pro";
import { useEffect, useRef, useState, useTransition } from "react";
import { ProUpsellOverlay } from "@app/components/pro/ProUpsellOverlay";
import { SampleDataLabel } from "@app/components/pro/SampleDataLabel";
import { useProGatedFeatures } from "@app/hooks/pro/useProGatedFeatures";
import { useProGatedResource } from "@app/hooks/pro/useProGatedResource";
import { useSeasonTrendGranularity } from "@app/hooks/pro/useSeasonTrendGranularity";
import {
  type AnalysisFilters as Filters,
  type AnalysisInitialData,
  type BattingTrendGranularity,
  type CountSituations,
  type PitcherFaceoffData,
  type PitchTypeData,
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
import { ProSampleSection } from "./ProSampleSection";
import { ProSectionPlaceholder } from "./ProSectionPlaceholder";
import {
  SAMPLE_COUNT_SITUATIONS,
  SAMPLE_HIT_DIRECTIONS,
  SAMPLE_PITCH_TYPES,
  SAMPLE_PITCHER_FACEOFFS,
} from "./proStatsSampleData";
import { RunnersSituationCard } from "./RunnersSituationCard";
import { SprayChart, type SprayChartMode } from "./SprayChart";
import { TimingCard } from "./TimingCard";

function buildYearOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption[] = [{ key: "通算", label: "通算" }];
  for (let offset = 0; offset < 6; offset += 1) {
    const year = String(currentYear - offset);
    options.push({ key: year, label: year });
  }
  return options;
}

/** SSR で解決した Pro 限定ブロックのデータ。閲覧できない機能は null。 */
export interface ProAnalysisData {
  countSituations: CountSituations | null;
  pitchTypes: PitchTypeData | null;
  pitcherFaceoffs: PitcherFaceoffData | null;
}

interface AnalysisContainerProps {
  /** SSR で取得した初期表示データ。マウント時はこれを使い再取得しない。 */
  initialData: AnalysisInitialData;
  initialProData: ProAnalysisData;
  /** SSR で閲覧可と判定された Pro 機能。クライアント判定が確定するまでの初期値。 */
  initialProFeatures: readonly ProFeature[];
  /** サーバーで取得したシーズン/大会のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
}

/** 打撃成績分析（基本指標 + 打球チャート + 打球方向）のコンテナ。 */
export function AnalysisContainer({
  initialData,
  initialProData,
  initialProFeatures,
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
  const [pitcherAttributes, setPitcherAttributes] = useState(
    initialData.pitcherAttributes,
  );
  const [sprayChartMode, setSprayChartMode] =
    useState<SprayChartMode>("scatter");
  const [battingTrend, setBattingTrend] = useState(initialData.battingTrend);
  const [isRefetching, startRefetch] = useTransition();
  // 推移グラフは粒度切替で単独再取得もあるため、専用の pending でグラフだけ dim する。
  const [isTrendPending, startTrendTransition] = useTransition();
  const [yearOptions] = useState(buildYearOptions);

  const { granularity, requestGranularity, resolveTrend } =
    useSeasonTrendGranularity<BattingTrendGranularity>({
      seasonKey: "season",
      freeKey: "game",
      initialGranted: initialProFeatures,
    });

  const { canView, unwrap } = useProGatedFeatures(initialProFeatures);
  const canViewHitDirectionDetail = canView("hit_direction_average");
  const canViewCountSituations = canView("count_situation_average");
  const canViewPitchTypes = canView("pitch_type_average");
  const canViewPitcherFaceoffs = canView("pitcher_faceoff_average");

  const countSituations = useProGatedResource({
    feature: "count_situation_average",
    canView: canViewCountSituations,
    initialData: initialProData.countSituations,
    criteria: filters,
    fetcher: getCountSituations,
    unwrap,
  });
  const pitchTypes = useProGatedResource({
    feature: "pitch_type_average",
    canView: canViewPitchTypes,
    initialData: initialProData.pitchTypes,
    criteria: filters,
    fetcher: getPitchTypes,
    unwrap,
  });
  const pitcherFaceoffs = useProGatedResource({
    feature: "pitcher_faceoff_average",
    canView: canViewPitcherFaceoffs,
    initialData: initialProData.pitcherFaceoffs,
    criteria: filters,
    fetcher: getPitcherFaceoffs,
    unwrap,
  });

  // 初回は SSR の initialData を使うため再取得しない（フィルタ変更時のみ取得）。
  const didInitRef = useRef(false);
  const didInitTrendRef = useRef(false);

  // フィルタ変更時のみ、メイン指標と打球詳細系（Pro 限定の3種を除く）を
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

  // 推移グラフは粒度/フィルタ切替で独立に再取得する（初回は initialData を使う）。
  // 専用 transition で更新が終わるまでグラフを dim し、古い値が一瞬出るのを防ぐ。
  useEffect(() => {
    if (!didInitTrendRef.current) {
      didInitTrendRef.current = true;
      return;
    }
    let active = true;
    startTrendTransition(async () => {
      const result = await getBattingTrend(filters, granularity);
      if (!active) return;
      // シーズン粒度が 403 なら resolveTrend が粒度を戻し、この effect が再実行される。
      const data = resolveTrend(result);
      if (data) setBattingTrend(data);
    });
    return () => {
      active = false;
    };
  }, [filters, granularity, resolveTrend, startTrendTransition]);

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
            onGranularityChange={requestGranularity}
          />
        </div>
        <SprayChart
          directions={hitDirections.directions}
          homeRuns={hitDirections.home_runs}
          points={hitLocations.points}
          mode={sprayChartMode}
          onModeChange={setSprayChartMode}
        />
        {canViewHitDirectionDetail ? (
          <HitDirectionTable directions={hitDirections.directions} />
        ) : (
          // 暗幕越しでも架空の打率は読めるため、他3ブロックと同じ注記を暗幕の外に出す。
          <div className="flex flex-col gap-y-2">
            <SampleDataLabel />
            <ProUpsellOverlay feature="hit_direction_average">
              <HitDirectionTable directions={SAMPLE_HIT_DIRECTIONS} />
            </ProUpsellOverlay>
          </div>
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
        {countSituations ? (
          <CountSituationCards data={countSituations} />
        ) : canViewCountSituations ? (
          <ProSectionPlaceholder label="カウント別の打率" />
        ) : (
          <ProSampleSection feature="count_situation_average">
            <CountSituationCards data={SAMPLE_COUNT_SITUATIONS} />
          </ProSampleSection>
        )}
        {pitchTypes ? (
          <PitchTypeCard
            rows={pitchTypes.rows}
            totalTargetPa={pitchTypes.total_target_pa}
          />
        ) : canViewPitchTypes ? (
          <ProSectionPlaceholder label="球種別の打率" />
        ) : (
          <ProSampleSection feature="pitch_type_average">
            <PitchTypeCard
              rows={SAMPLE_PITCH_TYPES.rows}
              totalTargetPa={SAMPLE_PITCH_TYPES.total_target_pa}
            />
          </ProSampleSection>
        )}
        {pitcherFaceoffs ? (
          <PitcherFaceoffList
            rows={pitcherFaceoffs.rows}
            minPlateAppearances={pitcherFaceoffs.min_plate_appearances}
            totalTargetPa={pitcherFaceoffs.total_target_pa}
          />
        ) : canViewPitcherFaceoffs ? (
          <ProSectionPlaceholder label="対戦投手別" />
        ) : (
          <ProSampleSection feature="pitcher_faceoff_average">
            <PitcherFaceoffList
              rows={SAMPLE_PITCHER_FACEOFFS.rows}
              minPlateAppearances={
                SAMPLE_PITCHER_FACEOFFS.min_plate_appearances
              }
              totalTargetPa={SAMPLE_PITCHER_FACEOFFS.total_target_pa}
            />
          </ProSampleSection>
        )}
        <PitcherAttributeSummary data={pitcherAttributes} />
      </div>
    </div>
  );
}
