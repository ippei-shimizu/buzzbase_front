"use client";
import type { FilterOption } from "../../statsFilterOption";
import { useEffect, useRef, useState, useTransition } from "react";
import ProUpgradeModal from "@app/components/pro/ProUpgradeModal";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  type AnalysisFilters as Filters,
  type EraTrendData,
  type EraTrendGranularity,
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
  initialEraTrend: EraTrendData;
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
  const { hasEntitlement } = useEntitlement();
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [granularity, setGranularity] = useState<EraTrendGranularity>("month");
  const [eraTrend, setEraTrend] = useState<EraTrendData>(initialEraTrend);
  const [isRefetching, startRefetch] = useTransition();
  const [yearOptions] = useState(buildYearOptions);
  const [seasonPaywallOpen, setSeasonPaywallOpen] = useState(false);

  const fetchTrend = (next: Filters, nextGranularity: EraTrendGranularity) => {
    startRefetch(async () => {
      // 防御率推移は year/season/tournament のみで絞る（種別は対象外）。
      const trend = await getEraTrend(
        {
          year: next.year,
          seasonId: next.seasonId,
          tournamentId: next.tournamentId,
        },
        nextGranularity,
      );
      setEraTrend(trend);
    });
  };

  // 初回は SSR の initialEraTrend を使うため再取得しない（フィルタ変更時のみ取得）。
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    fetchTrend(filters, granularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchTrendはfilters/granularityと同じ値を毎回内部で使うため依存に含めない
  }, [filters.year, filters.seasonId, filters.tournamentId, granularity]);

  const handleGranularityChange = (next: EraTrendGranularity) => {
    if (next === "season" && !hasEntitlement("season_transition_graph")) {
      setSeasonPaywallOpen(true);
      return;
    }
    setGranularity(next);
  };

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
          points={eraTrend.points}
          granularity={granularity}
          onGranularityChange={handleGranularityChange}
        />
      </div>
      <ProUpgradeModal
        isOpen={seasonPaywallOpen}
        onClose={() => setSeasonPaywallOpen(false)}
        trigger="season_transition_graph"
      />
    </div>
  );
}
