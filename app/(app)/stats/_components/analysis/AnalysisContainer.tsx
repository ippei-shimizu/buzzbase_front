"use client";
import type { FilterOption } from "../../statsFilterOption";
import { useEffect, useRef, useState, useTransition } from "react";
import { ProUpsellOverlay } from "@app/components/pro/ProUpsellOverlay";
import { useProGatedFeatures } from "@app/hooks/pro/useProGatedFeatures";
import {
  type AnalysisFilters as Filters,
  type AnalysisInitialData,
  type BattingTrendGranularity,
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
import {
  EMPTY_COUNT_SITUATIONS,
  EMPTY_PITCH_TYPES,
  EMPTY_PITCHER_FACEOFFS,
} from "../../analysisFallbacks";
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

// 球場図は他ブロックより背が高いため、判定待ちのプレースホルダーも合わせて確保する。
const HIT_DIRECTION_PLACEHOLDER_HEIGHT = "h-[420px]";

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
  const [countSituations, setCountSituations] = useState(
    EMPTY_COUNT_SITUATIONS,
  );
  const [pitchTypes, setPitchTypes] = useState(EMPTY_PITCH_TYPES);
  const [pitcherFaceoffs, setPitcherFaceoffs] = useState(
    EMPTY_PITCHER_FACEOFFS,
  );
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

  const {
    isResolving: isProResolving,
    canView,
    unwrap,
  } = useProGatedFeatures();
  const canViewHitDirectionDetail = canView("hit_direction_average");
  const canViewCountSituations = canView("count_situation_average");
  const canViewPitchTypes = canView("pitch_type_average");
  const canViewPitcherFaceoffs = canView("pitcher_faceoff_average");

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

  // Pro 限定の3種は entitlement 判定がクライアントでしか出来ないため SSR せず、
  // 閲覧できる機能ぶんだけクライアントで取得する（無料ユーザーに無駄な 403 を出さない）。
  // 判定確定前は canView がすべて false になるので、確定後に再実行されて取得が走る。
  useEffect(() => {
    if (
      !canViewCountSituations &&
      !canViewPitchTypes &&
      !canViewPitcherFaceoffs
    ) {
      return;
    }
    let active = true;
    void Promise.all([
      canViewCountSituations ? getCountSituations(filters) : null,
      canViewPitchTypes ? getPitchTypes(filters) : null,
      canViewPitcherFaceoffs ? getPitcherFaceoffs(filters) : null,
    ]).then(([counts, pitches, faceoffs]) => {
      if (!active) return;
      if (counts) {
        setCountSituations(
          unwrap("count_situation_average", counts, EMPTY_COUNT_SITUATIONS),
        );
      }
      if (pitches) {
        setPitchTypes(unwrap("pitch_type_average", pitches, EMPTY_PITCH_TYPES));
      }
      if (faceoffs) {
        setPitcherFaceoffs(
          unwrap("pitcher_faceoff_average", faceoffs, EMPTY_PITCHER_FACEOFFS),
        );
      }
    });
    return () => {
      active = false;
    };
  }, [
    filters,
    canViewCountSituations,
    canViewPitchTypes,
    canViewPitcherFaceoffs,
    unwrap,
  ]);

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
        {isProResolving ? (
          <ProSectionPlaceholder className={HIT_DIRECTION_PLACEHOLDER_HEIGHT} />
        ) : canViewHitDirectionDetail ? (
          <HitDirectionTable directions={hitDirections.directions} />
        ) : (
          // 打率の数値そのものが訴求対象なので、サンプルでも暗幕で覆って CTA を前に出す。
          <ProUpsellOverlay feature="hit_direction_average">
            <HitDirectionTable directions={SAMPLE_HIT_DIRECTIONS} />
          </ProUpsellOverlay>
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
        {isProResolving ? (
          <ProSectionPlaceholder />
        ) : canViewCountSituations ? (
          <CountSituationCards data={countSituations} />
        ) : (
          <ProSampleSection feature="count_situation_average">
            <CountSituationCards data={SAMPLE_COUNT_SITUATIONS} />
          </ProSampleSection>
        )}
        {isProResolving ? (
          <ProSectionPlaceholder />
        ) : canViewPitchTypes ? (
          <PitchTypeCard
            rows={pitchTypes.rows}
            totalTargetPa={pitchTypes.total_target_pa}
          />
        ) : (
          <ProSampleSection feature="pitch_type_average">
            <PitchTypeCard
              rows={SAMPLE_PITCH_TYPES.rows}
              totalTargetPa={SAMPLE_PITCH_TYPES.total_target_pa}
            />
          </ProSampleSection>
        )}
        {isProResolving ? (
          <ProSectionPlaceholder />
        ) : canViewPitcherFaceoffs ? (
          <PitcherFaceoffList
            rows={pitcherFaceoffs.rows}
            minPlateAppearances={pitcherFaceoffs.min_plate_appearances}
            totalTargetPa={pitcherFaceoffs.total_target_pa}
          />
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
