"use client";
import type { FilterOption } from "@app/components/filter/filterTypes";
import { useEffect, useRef, useState, useTransition } from "react";
import FilterBar from "@app/components/filter/FilterBar";
import { buildRecentYearOptions } from "@app/components/filter/yearOptions";
import {
  type AnalysisFilters as Filters,
  type EraTrendPoint,
  getEraTrend,
} from "../../analysisActions";
import { EraTrendChart } from "./EraTrendChart";

interface PitchingAnalysisContainerProps {
  /** SSR で取得した防御率推移の初期データ。マウント時はこれを使い再取得しない。 */
  initialEraTrend: EraTrendPoint[];
  /** サーバーで取得したシーズン/大会/年月のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
  monthOptions: FilterOption[];
}

/** 投手タブの分析（フィルタ + 防御率推移グラフ）コンテナ。 */
export function PitchingAnalysisContainer({
  initialEraTrend,
  seasonOptions,
  tournamentOptions,
  monthOptions,
}: PitchingAnalysisContainerProps) {
  const [filters, setFilters] = useState<Filters>({});
  const [eraTrend, setEraTrend] = useState<EraTrendPoint[]>(initialEraTrend);
  const [isRefetching, startRefetch] = useTransition();
  const [yearOptions] = useState(buildRecentYearOptions);

  // 初回は SSR の initialEraTrend を使うため再取得しない（フィルタ変更時のみ取得）。
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    let active = true;
    // 防御率推移は year/月範囲/season/tournament のみで絞る（種別は対象外）。
    startRefetch(async () => {
      const trend = await getEraTrend({
        year: filters.year,
        seasonId: filters.seasonId,
        tournamentId: filters.tournamentId,
        startMonth: filters.startMonth,
        endMonth: filters.endMonth,
      });
      if (active) setEraTrend(trend);
    });
    return () => {
      active = false;
    };
  }, [
    filters.year,
    filters.seasonId,
    filters.tournamentId,
    filters.startMonth,
    filters.endMonth,
    startRefetch,
  ]);

  return (
    <div className="flex flex-col gap-y-5">
      {/* 種別チップは出さない（防御率推移が match_type で絞れないため）。 */}
      <FilterBar
        values={filters}
        onChange={setFilters}
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
        <EraTrendChart data={eraTrend} />
      </div>
    </div>
  );
}
