"use client";

import type { FilterOption } from "../../../stats/statsFilterOption";
import type {
  GameSummaryFilters,
  GameSummaryResult,
} from "../gameSummaryTypes";
import { Spinner } from "@heroui/react";
import { useEffect, useState, useTransition } from "react";
import { AnalysisFilters } from "../../../stats/_components/analysis/AnalysisFilters";
import {
  getGameSummary,
  getGameSummaryFilterOptions,
} from "../gameSummaryActions";
import { GameResultSummary } from "./summary/GameResultSummary";

const DEFAULT_FILTERS: GameSummaryFilters = { year: "通算", matchType: "" };

function buildYearOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption[] = [{ key: "通算", label: "通算" }];
  for (let offset = 0; offset < 6; offset += 1) {
    const year = String(currentYear - offset);
    options.push({ key: year, label: year });
  }
  return options;
}

/** サマリータブ本体。フィルタ（年度/種別/シーズン/大会）変更で再取得し、結果を表示する。 */
export function GameSummaryContainer() {
  const [filters, setFilters] = useState<GameSummaryFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<GameSummaryResult | null>(null);
  const [seasonOptions, setSeasonOptions] = useState<FilterOption[]>([]);
  const [tournamentOptions, setTournamentOptions] = useState<FilterOption[]>(
    [],
  );
  const [isRefetching, startRefetch] = useTransition();
  const [yearOptions] = useState(buildYearOptions);

  // シーズン / 大会の選択肢はマウント時に1度だけ取得する。
  useEffect(() => {
    let active = true;
    getGameSummaryFilterOptions().then((options) => {
      if (!active) return;
      setSeasonOptions(options.seasonOptions);
      setTournamentOptions(options.tournamentOptions);
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
    return (
      <div className="flex justify-center py-16">
        <Spinner color="default" size="sm" />
      </div>
    );
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
      <AnalysisFilters
        filters={filters}
        onChange={setFilters}
        yearOptions={yearOptions}
        seasonOptions={seasonOptions}
        tournamentOptions={tournamentOptions}
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
