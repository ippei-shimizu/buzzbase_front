"use client";
import type { FilterOption } from "../../statsFilterOption";
import type { ProFeature } from "@app/types/pro";
import { useEffect, useRef, useState, useTransition } from "react";
import { useSeasonTrendGranularity } from "@app/hooks/pro/useSeasonTrendGranularity";
import {
  type AnalysisFilters as Filters,
  type EraTrendGranularity,
  type EraTrendPoint,
  getEraTrend,
} from "../../analysisActions";
import { AnalysisFilters } from "./AnalysisFilters";
import { EraTrendChart } from "./EraTrendChart";

function buildYearOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption[] = [{ key: "通算", label: "通算" }];
  for (let offset = 0; offset < 6; offset += 1) {
    const year = String(currentYear - offset);
    options.push({ key: year, label: year });
  }
  return options;
}

interface PitchingAnalysisContainerProps {
  /** SSR で取得した防御率推移の初期データ（月粒度）。マウント時はこれを使い再取得しない。 */
  initialEraTrend: EraTrendPoint[];
  /** SSR で閲覧可と判定された Pro 機能。クライアント判定が確定するまでの初期値。 */
  initialProFeatures: readonly ProFeature[];
  /** サーバーで取得したシーズン/大会のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
}

/** 投手タブの分析（フィルタ + 防御率推移グラフ）コンテナ。 */
export function PitchingAnalysisContainer({
  initialEraTrend,
  initialProFeatures,
  seasonOptions,
  tournamentOptions,
}: PitchingAnalysisContainerProps) {
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [eraTrend, setEraTrend] = useState<EraTrendPoint[]>(initialEraTrend);
  const [isRefetching, startRefetch] = useTransition();
  const [yearOptions] = useState(buildYearOptions);

  const { granularity, requestGranularity, resolveTrend } =
    useSeasonTrendGranularity<EraTrendGranularity>({
      seasonKey: "season",
      freeKey: "month",
      initialGranted: initialProFeatures,
    });

  // 初回は SSR の initialEraTrend を使うため再取得しない（フィルタ/粒度変更時のみ取得）。
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    let active = true;
    // 防御率推移は year/season/tournament のみで絞る（種別は対象外）。
    startRefetch(async () => {
      const result = await getEraTrend(
        {
          year: filters.year,
          seasonId: filters.seasonId,
          tournamentId: filters.tournamentId,
        },
        granularity,
      );
      if (!active) return;
      // シーズン粒度が 403 なら resolveTrend が粒度を戻し、この effect が再実行される。
      const data = resolveTrend(result);
      if (data) setEraTrend(data.points);
    });
    return () => {
      active = false;
    };
  }, [
    filters.year,
    filters.seasonId,
    filters.tournamentId,
    granularity,
    resolveTrend,
    startRefetch,
  ]);

  return (
    <div className="flex flex-col gap-y-5">
      <AnalysisFilters
        filters={filters}
        onChange={setFilters}
        yearOptions={yearOptions}
        seasonOptions={seasonOptions}
        tournamentOptions={tournamentOptions}
        hideMatchType
      />
      <div
        className={isRefetching ? "opacity-50 transition-opacity" : undefined}
      >
        <EraTrendChart
          points={eraTrend}
          granularity={granularity}
          onGranularityChange={requestGranularity}
        />
      </div>
    </div>
  );
}
