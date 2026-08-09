"use client";

import type {
  GameSummaryFilters,
  GameSummaryResult,
} from "../gameSummaryTypes";
import type { FilterOption } from "@app/components/filter/filterTypes";
import { useEffect, useState, useTransition } from "react";
import FilterBar from "@app/components/filter/FilterBar";
import { MATCH_TYPE_OPTIONS } from "@app/components/filter/matchTypeOptions";
import { buildRecentYearOptions } from "@app/components/filter/yearOptions";
import {
  getGameSummary,
  getGameSummaryFilterOptions,
} from "../gameSummaryActions";
import { GameResultSummary } from "./summary/GameResultSummary";
import { GameSummarySkeleton } from "./summary/GameSummarySkeleton";

/** サマリータブ本体。フィルタ（年度/月範囲/種別/シーズン/大会）変更で再取得し、結果を表示する。 */
export function GameSummaryContainer() {
  const [filters, setFilters] = useState<GameSummaryFilters>({});
  const [result, setResult] = useState<GameSummaryResult | null>(null);
  const [seasonOptions, setSeasonOptions] = useState<FilterOption[]>([]);
  const [tournamentOptions, setTournamentOptions] = useState<FilterOption[]>(
    [],
  );
  const [monthOptions, setMonthOptions] = useState<FilterOption[]>([]);
  const [isRefetching, startRefetch] = useTransition();
  const [yearOptions] = useState(buildRecentYearOptions);

  // シーズン / 大会 / 年月の選択肢はマウント時に1度だけ取得する。
  useEffect(() => {
    let active = true;
    getGameSummaryFilterOptions().then((options) => {
      if (!active) return;
      setSeasonOptions(options.seasonOptions);
      setTournamentOptions(options.tournamentOptions);
      setMonthOptions(options.monthOptions);
    });
    return () => {
      active = false;
    };
  }, []);

  // 初回マウント・フィルタ変更のどちらでもサマリーを取得する（SSR initialData は持たない）。
  useEffect(() => {
    let active = true;
    startRefetch(async () => {
      const data = await getGameSummary(filters);
      if (active) setResult(data);
    });
    return () => {
      active = false;
    };
  }, [filters, startRefetch]);

  if (!result) {
    return <GameSummarySkeleton />;
  }

  if (result.status === "unauthenticated") {
    return (
      <p className="py-10 text-center text-sm text-[#A1A1AA]">
        ログインが必要です。
      </p>
    );
  }

  if (result.status === "forbidden") {
    return (
      <p className="py-10 text-center text-sm text-[#A1A1AA]">
        このアカウントは非公開です。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <FilterBar
        values={filters}
        onChange={setFilters}
        options={{
          years: yearOptions,
          months: monthOptions,
          matchTypes: MATCH_TYPE_OPTIONS,
          seasons: seasonOptions,
          tournaments: tournamentOptions,
        }}
      />
      {result.status === "error" ? (
        <p className="py-10 text-center text-sm text-[#A1A1AA]">
          サマリーを取得できませんでした。
        </p>
      ) : (
        <div
          className={isRefetching ? "opacity-50 transition-opacity" : undefined}
        >
          <GameResultSummary summary={result.data} />
        </div>
      )}
    </div>
  );
}
