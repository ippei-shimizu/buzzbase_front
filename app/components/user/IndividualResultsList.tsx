"use client";

import type { SeasonData } from "@app/interface";
import { Skeleton } from "@heroui/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FilterChip from "@app/components/filter/FilterChip";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
import PeriodRangeFilter from "@app/components/filter/PeriodRangeFilter";
import BattingAverageTable from "@app/components/table/BattingAverageTable";
import PitchingRecordTable from "@app/components/table/PitchingRecordTable";
import { usePersonalBattingAverage } from "@app/hooks/batting/getPersonalBattingAverage";
import { usePersonalBattingStatus } from "@app/hooks/batting/getPersonalBattingStatus";
import { usePersonalPitchingResult } from "@app/hooks/pitching/getPersonalPitchingResult";
import { usePersonalPitchingResultStats } from "@app/hooks/pitching/getPersonalPitchingResultStats";
import {
  getAvailableMonths,
  getMatchResultsUserId,
} from "@app/services/matchResultsService";
import { getSeasons } from "@app/services/seasonsService";
import { monthOptionsFromRecorded } from "@app/utils/buildMonthOptions";
import { formatRate, formatEra } from "@app/utils/formatStats";

type UserId = {
  userId: number;
};

type AvailableYear = number | string;
type AvailableMatchType = string;

export default function IndividualResultsList(props: UserId) {
  const { userId } = props;
  const [selectedYear, setSelectedYear] = useState("通算");
  const [yearOptions, setYearOptions] = useState<
    { key: string; label: string }[]
  >([{ key: "通算", label: "通算" }]);
  const [selectedMatchType, setSelectedMatchType] = useState("全て");
  const [matchTypeOptions, setMatchTypeOptions] = useState<
    { key: string; label: string }[]
  >([{ key: "全て", label: "全て" }]);
  const [selectedSeason, setSelectedSeason] = useState("全て");
  const [seasonsData, setSeasonsData] = useState<SeasonData[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<
    { key: string; label: string }[]
  >([{ key: "全て", label: "全て" }]);
  const [startMonth, setStartMonth] = useState<string | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<string | undefined>(undefined);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // シーズンデータ取得
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasonsList = await getSeasons(userId);
        setSeasonsData(seasonsList);
        const opts = [
          { key: "全て", label: "全て" },
          ...seasonsList.map((s: SeasonData) => ({
            key: s.name,
            label: s.name,
          })),
        ];
        setSeasonOptions(opts);
      } catch (error) {
        console.error("Failed to fetch seasons:", error);
      }
    };
    fetchSeasons();
  }, [userId]);

  // 年度・試合タイプ一覧取得
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        // 試合一覧と記録月は互いに独立なので並列取得して初回のフィルタ確定を早める。
        const [matchResultData, months] = await Promise.all([
          getMatchResultsUserId(userId),
          getAvailableMonths(userId),
        ]);
        // 年度抽出
        const yearArray: AvailableYear[] = matchResultData.map(
          (result: { date_and_time: string }) =>
            new Date(result.date_and_time).getFullYear(),
        );
        const uniqueYears = Array.from(new Set(yearArray));
        const yOpts = [
          { key: "通算", label: "通算" },
          ...uniqueYears.map((y) => ({ key: String(y), label: String(y) })),
        ];
        setYearOptions(yOpts);
        // 試合タイプ抽出（keyにAPI値、labelに日本語）
        const matchTypeData: AvailableMatchType[] = matchResultData.map(
          (type: { match_type: string }) => type.match_type,
        );
        const uniqueMatchTypes = Array.from(new Set(matchTypeData));
        const matchTypeLabels: Record<string, string> = {
          regular: "公式戦",
          open: "オープン戦",
        };
        const mtOpts = [
          { key: "全て", label: "全て" },
          ...uniqueMatchTypes.map((t) => ({
            key: t,
            label: matchTypeLabels[t] ?? t,
          })),
        ];
        setMatchTypeOptions(mtOpts);
        // 期間フィルタは記録のある年月だけを候補にする
        setAvailableMonths(months);
      } catch (error) {
        console.error("Failed to fetch meta:", error);
      }
    };
    fetchMeta();
  }, [userId]);

  const seasonId = useMemo(() => {
    return selectedSeason !== "全て"
      ? seasonsData.find((s) => s.name === selectedSeason)?.id
      : undefined;
  }, [selectedSeason, seasonsData]);

  const monthOptions = useMemo(
    () => monthOptionsFromRecorded(availableMonths),
    [availableMonths],
  );

  // 年度と期間は排他: 実年を選んだら期間をクリアする（通算選択時は据え置き）
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    if (value !== "通算") {
      setStartMonth(undefined);
      setEndMonth(undefined);
    }
  };
  // 期間を設定したら年度を通算へ戻す（両端クリア時は年度を据え置く）
  const handlePeriodChange = (range: {
    startMonth?: string;
    endMonth?: string;
  }) => {
    setStartMonth(range.startMonth);
    setEndMonth(range.endMonth);
    if (range.startMonth || range.endMonth) {
      setSelectedYear("通算");
    }
  };

  // API送信用の値
  const yearParam = selectedYear !== "通算" ? selectedYear : undefined;
  const matchTypeParam =
    selectedMatchType !== "全て" ? selectedMatchType : undefined;

  const { personalBattingAverages, isLoadingBA } = usePersonalBattingAverage(
    userId,
    seasonId,
    yearParam,
    matchTypeParam,
    startMonth,
    endMonth,
  );
  const { personalBattingStatus, isLoadingBS } = usePersonalBattingStatus(
    userId,
    seasonId,
    yearParam,
    matchTypeParam,
    startMonth,
    endMonth,
  );
  const { personalPitchingResults, isLoadingPR } = usePersonalPitchingResult(
    userId,
    seasonId,
    yearParam,
    matchTypeParam,
    startMonth,
    endMonth,
  );
  const { personalPitchingStatus, isLoadingPS } =
    usePersonalPitchingResultStats(
      userId,
      seasonId,
      yearParam,
      matchTypeParam,
      startMonth,
      endMonth,
    );

  const isLoading = isLoadingBA || isLoadingBS || isLoadingPR || isLoadingPS;

  if (isLoading) {
    return (
      <div className="my-6">
        <Skeleton className="rounded-lg">
          <div className="h-80 w-full rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg_sub p-4 rounded-xl lg:p-6">
        <div className="mb-5 overflow-hidden">
          <FilterChipGroup>
            <FilterChip
              label="年度"
              value={selectedYear}
              defaultValue="通算"
              options={yearOptions}
              onChange={handleYearChange}
            />
            <FilterChip
              label="種別"
              value={selectedMatchType}
              defaultValue="全て"
              options={matchTypeOptions}
              onChange={setSelectedMatchType}
            />
            <FilterChip
              label="シーズン"
              value={selectedSeason}
              defaultValue="全て"
              options={seasonOptions}
              onChange={setSelectedSeason}
            />
            <PeriodRangeFilter
              startMonth={startMonth}
              endMonth={endMonth}
              monthOptions={monthOptions}
              onChange={handlePeriodChange}
            />
          </FilterChipGroup>
        </div>
        <h2 className="text-sm text-zinc-400">打撃成績</h2>
        {personalBattingAverages?.[0] &&
          personalBattingStatus &&
          (() => {
            const ba = personalBattingAverages[0];
            return (
              <div className="mb-2 py-2">
                <p>
                  <span className="text-sm text-zinc-200">打率</span>
                  <span
                    className="text-xl font-bold ml-1"
                    style={{ color: "#d08000" }}
                  >
                    {formatRate(personalBattingStatus.batting_average)}
                  </span>
                  <span className="text-sm text-zinc-200 ml-3">
                    {ba.number_of_matches}試合
                  </span>
                </p>
                <p className="text-sm text-zinc-300 mt-0.5">
                  {ba.times_at_bat}打席 {ba.at_bats}打数{" "}
                  {personalBattingStatus.total_hits}安打 / {ba.runs_batted_in}
                  打点 {ba.home_run}本塁打
                </p>
              </div>
            );
          })()}
        <BattingAverageTable
          personalBattingAverages={personalBattingAverages}
          personalBattingStatus={personalBattingStatus}
        />
        <h2 className="text-sm text-zinc-400 mt-8">投手成績</h2>
        {personalPitchingResults?.[0] &&
          personalPitchingStatus &&
          (() => {
            const pr = personalPitchingResults[0];
            return (
              <div className="mb-2 py-2">
                <p>
                  <span className="text-sm text-zinc-200">防御率</span>
                  <span
                    className="text-xl font-bold ml-1"
                    style={{ color: "#338EF7" }}
                  >
                    {formatEra(personalPitchingStatus.era)}
                  </span>
                  <span className="text-sm text-zinc-200 ml-3">
                    {pr.number_of_appearances}登板
                  </span>
                </p>
                <p className="text-sm text-zinc-300 mt-0.5">
                  {pr.innings_pitched}回 {pr.win}勝{pr.loss}敗 / {pr.strikeouts}
                  奪三振
                </p>
              </div>
            );
          })()}
        <PitchingRecordTable
          personalPitchingResults={personalPitchingResults}
          personalPitchingStatus={personalPitchingStatus}
        />
        <Link
          href="/calculation-of-grades"
          className="text-xs font-normal border-b mt-4 ml-auto mr-0 block w-fit"
        >
          成績の算出方法について
        </Link>
      </div>
    </>
  );
}
