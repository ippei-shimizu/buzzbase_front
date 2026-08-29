"use client";
import type { FilterOption } from "@app/components/filter/filterTypes";
import type { ProFeature } from "@app/types/pro";
import { useEffect, useRef, useState, useTransition } from "react";
import FilterBar from "@app/components/filter/FilterBar";
import { trackFilterChanges } from "@app/components/filter/trackFilterChange";
import { buildRecentYearOptions } from "@app/components/filter/yearOptions";
import { useSeasonTrendGranularity } from "@app/hooks/pro/useSeasonTrendGranularity";
import { trackEraTrendGranularityChanged } from "@app/utils/analytics";
import {
  type AnalysisFilters as Filters,
  type EraTrendGranularity,
  type EraTrendPoint,
  getEraTrend,
} from "../../analysisActions";
import { EraTrendChart } from "./EraTrendChart";

interface PitchingAnalysisContainerProps {
  /** SSR で取得した防御率推移の初期データ（月粒度）。マウント時はこれを使い再取得しない。 */
  initialEraTrend: EraTrendPoint[];
  /** SSR で閲覧可と判定された Pro 機能。クライアント判定が確定するまでの初期値。 */
  initialProFeatures: readonly ProFeature[];
  /** サーバーで取得したシーズン/大会/年月のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
  monthOptions: FilterOption[];
}

/** 投手タブの分析（フィルタ + 防御率推移グラフ）コンテナ。 */
export function PitchingAnalysisContainer({
  initialEraTrend,
  initialProFeatures,
  seasonOptions,
  tournamentOptions,
  monthOptions,
}: PitchingAnalysisContainerProps) {
  const [filters, setFilters] = useState<Filters>({});
  const [eraTrend, setEraTrend] = useState<EraTrendPoint[]>(initialEraTrend);
  const [isRefetching, startRefetch] = useTransition();
  const [yearOptions] = useState(buildRecentYearOptions);

  const { granularity, requestGranularity, resolveTrend } =
    useSeasonTrendGranularity<EraTrendGranularity>({
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
    // 種別は getEraTrend 側で構造的に落とすため、ここでは filters をそのまま渡す
    // （フィールドを手で並べると、絞り込み項目が増えたときに漏れる）。
    startRefetch(async () => {
      const result = await getEraTrend(filters, granularity);
      if (!active) return;
      // シーズン粒度が 403 なら resolveTrend が粒度を戻し、この effect が再実行される。
      const data = resolveTrend(result);
      if (data) setEraTrend(data.points);
    });
    return () => {
      active = false;
    };
  }, [filters, granularity, resolveTrend, startRefetch]);

  const handleFiltersChange = (next: Filters) => {
    trackFilterChanges(filters, next);
    setFilters(next);
  };

  const handleGranularityChange = (next: EraTrendGranularity) => {
    trackEraTrendGranularityChanged(next);
    requestGranularity(next);
  };

  return (
    <div className="flex flex-col gap-y-5">
      {/* 種別チップは出さない（防御率推移が match_type で絞れないため）。 */}
      <FilterBar
        values={filters}
        onChange={handleFiltersChange}
        options={{
          years: yearOptions,
          months: monthOptions,
          seasons: seasonOptions,
          tournaments: tournamentOptions,
        }}
      />
      <div
        className={isRefetching ? "opacity-50 transition-opacity" : undefined}
      >
        <EraTrendChart
          points={eraTrend}
          granularity={granularity}
          onGranularityChange={handleGranularityChange}
        />
      </div>
    </div>
  );
}
