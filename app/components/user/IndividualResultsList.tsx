"use client";

import type { FilterValues } from "@app/components/filter/filterTypes";
import type {
  BattingStats,
  PitchingStats,
  StatsFetchResult,
} from "@app/interface/dashboardStats";
import type { UserStatsFilterOptions } from "@app/services/v2/dashboardStatsService";
import { Skeleton } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FilterBar from "@app/components/filter/FilterBar";
import { LockIcon } from "@app/components/icon/LockIcon";
import BattingAverageTable from "@app/components/table/BattingAverageTable";
import PitchingRecordTable from "@app/components/table/PitchingRecordTable";
import {
  getDashboardBattingStats,
  getDashboardPitchingStats,
  getUserStatsFilterOptions,
} from "@app/services/v2/dashboardStatsService";
import { formatEra, formatRate } from "@app/utils/formatStats";

interface IndividualResultsListProps {
  userId: number;
}

const EMPTY_FILTER_OPTIONS: UserStatsFilterOptions = {
  years: [],
  matchTypes: [],
  seasons: [],
};

/**
 * マイページ成績タブ。v2 ダッシュボード成績 API から打撃・投手成績を取得して表示する。
 *
 * マイページは Client Component ツリー（認証コンテキスト + タブ切替）配下にあり
 * Server Component から初期データを渡せないため、Server Actions を effect から呼ぶ。
 */
export default function IndividualResultsList({
  userId,
}: IndividualResultsListProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [filterOptions, setFilterOptions] =
    useState<UserStatsFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [batting, setBatting] = useState<StatsFetchResult<BattingStats> | null>(
    null,
  );
  const [pitching, setPitching] =
    useState<StatsFetchResult<PitchingStats> | null>(null);

  useEffect(() => {
    let active = true;
    void getUserStatsFilterOptions(userId).then((options) => {
      if (active) setFilterOptions(options);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    // 絞り込みを変えた直後に古い成績を残さないよう、取得中は未確定状態に戻す。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBatting(null);
    setPitching(null);
    // 打撃と投手は互いに独立しているため並列で取得する。
    void Promise.all([
      getDashboardBattingStats(userId, filters),
      getDashboardPitchingStats(userId, filters),
    ]).then(([battingResult, pitchingResult]) => {
      if (!active) return;
      setBatting(battingResult);
      setPitching(pitchingResult);
    });
    return () => {
      active = false;
    };
  }, [userId, filters]);

  if (!batting || !pitching) {
    return (
      <div className="my-6">
        <Skeleton className="rounded-lg">
          <div className="h-80 w-full rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    );
  }

  const isForbidden =
    batting.status === "forbidden" || pitching.status === "forbidden";

  if (isForbidden) {
    return (
      <div className="bg-bg_sub p-4 rounded-xl lg:p-6">
        <div className="flex flex-col items-center gap-y-3 py-10">
          <LockIcon fill="#a1a1aa" width="40" height="40" />
          <p className="text-sm text-zinc-400 text-center">
            このアカウントは非公開です
          </p>
        </div>
      </div>
    );
  }

  const hasError = batting.status === "error" || pitching.status === "error";
  const battingStats = batting.status === "ok" ? batting.data : null;
  const pitchingStats = pitching.status === "ok" ? pitching.data : null;
  const battingAggregate = battingStats?.aggregate ?? null;
  const battingCalculated = battingStats?.calculated ?? null;
  const pitchingAggregate = pitchingStats?.aggregate ?? null;
  const pitchingCalculated = pitchingStats?.calculated ?? null;
  const hasBatting = Boolean(battingAggregate || battingCalculated);
  const hasPitching = Boolean(pitchingAggregate || pitchingCalculated);

  return (
    <div className="bg-bg_sub p-4 rounded-xl lg:p-6">
      <div className="mb-5 overflow-hidden">
        <FilterBar
          values={filters}
          onChange={setFilters}
          options={{
            years: filterOptions.years,
            matchTypes: filterOptions.matchTypes,
            seasons: filterOptions.seasons,
          }}
        />
      </div>

      {hasError ? (
        <p className="py-10 text-sm text-zinc-400 text-center">
          成績の取得に失敗しました。時間をおいて再度お試しください。
        </p>
      ) : hasBatting || hasPitching ? (
        <>
          {hasBatting ? (
            <section>
              <h2 className="text-sm text-zinc-400">打撃成績</h2>
              {battingAggregate && battingCalculated ? (
                <div className="mb-2 py-2">
                  <p>
                    <span className="text-sm text-zinc-200">打率</span>
                    <span
                      className="text-xl font-bold ml-1"
                      style={{ color: "#d08000" }}
                    >
                      {formatRate(battingCalculated.batting_average)}
                    </span>
                    <span className="text-sm text-zinc-200 ml-3">
                      {battingAggregate.number_of_matches}試合
                    </span>
                  </p>
                  <p className="text-sm text-zinc-300 mt-0.5">
                    {battingAggregate.times_at_bat}打席{" "}
                    {battingAggregate.at_bats}打数 {battingAggregate.hit}安打 /{" "}
                    {battingAggregate.runs_batted_in}打点{" "}
                    {battingAggregate.home_run}本塁打
                  </p>
                </div>
              ) : null}
              <BattingAverageTable
                aggregate={battingAggregate}
                calculated={battingCalculated}
              />
            </section>
          ) : null}

          {hasPitching ? (
            <section className={hasBatting ? "mt-8" : undefined}>
              <h2 className="text-sm text-zinc-400">投手成績</h2>
              {pitchingAggregate && pitchingCalculated ? (
                <div className="mb-2 py-2">
                  <p>
                    <span className="text-sm text-zinc-200">防御率</span>
                    <span
                      className="text-xl font-bold ml-1"
                      style={{ color: "#338EF7" }}
                    >
                      {formatEra(pitchingCalculated.era)}
                    </span>
                    <span className="text-sm text-zinc-200 ml-3">
                      {pitchingAggregate.number_of_appearances}登板
                    </span>
                  </p>
                  <p className="text-sm text-zinc-300 mt-0.5">
                    {pitchingAggregate.win}勝 {pitchingAggregate.loss}敗 /{" "}
                    {pitchingAggregate.innings_pitched}回{" "}
                    {pitchingAggregate.strikeouts}奪三振
                  </p>
                </div>
              ) : null}
              <PitchingRecordTable
                aggregate={pitchingAggregate}
                calculated={pitchingCalculated}
              />
            </section>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center gap-y-2 py-10">
          <p className="text-sm text-zinc-300">成績データがありません</p>
          <p className="text-xs text-zinc-400 text-center">
            試合結果を記録すると、ここに成績が表示されます
          </p>
        </div>
      )}

      <Link
        href="/calculation-of-grades"
        className="text-xs font-normal border-b mt-4 ml-auto mr-0 block w-fit"
      >
        成績の算出方法について
      </Link>
    </div>
  );
}
