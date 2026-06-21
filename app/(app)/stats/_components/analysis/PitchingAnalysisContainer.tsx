"use client";
import type { FilterOption } from "../../filterOptions";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  type AnalysisFilters as Filters,
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
  /** SSR で取得した防御率推移の初期データ。マウント時はこれを使い再取得しない。 */
  initialEraTrend: EraTrendPoint[];
  /** サーバーで取得したシーズン/大会のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
}

/** 投手タブの分析（フィルタ + 防御率推移グラフ）コンテナ。 */
export function PitchingAnalysisContainer({
  initialEraTrend,
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

  // 初回は SSR の initialEraTrend を使うため再取得しない（フィルタ変更時のみ取得）。
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    let active = true;
    // 防御率推移は year/season/tournament のみで絞る（種別は対象外）。
    startRefetch(async () => {
      const trend = await getEraTrend({
        year: filters.year,
        seasonId: filters.seasonId,
        tournamentId: filters.tournamentId,
      });
      if (active) setEraTrend(trend);
    });
    return () => {
      active = false;
    };
  }, [filters.year, filters.seasonId, filters.tournamentId, startRefetch]);

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
        <EraTrendChart data={eraTrend} />
      </div>
    </div>
  );
}
