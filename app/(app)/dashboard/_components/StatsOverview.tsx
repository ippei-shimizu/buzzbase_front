"use client";

import type {
  BattingStats,
  PitchingStats,
  SeasonOption,
  TournamentOption,
} from "../actions";
import { useState } from "react";
import FilterChip from "@app/components/filter/FilterChip";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
import PeriodRangeFilter, {
  type PeriodRange,
} from "@app/components/filter/PeriodRangeFilter";
import StatTooltipLabel from "@app/components/table/StatTooltipLabel";
import { INNING_FORMAT_TOOLTIP } from "@app/constants/pitchingTooltips";
import {
  monthOptionsFromRecorded,
  type MonthOption,
} from "@app/utils/buildMonthOptions";
import { formatRate, formatRate2, formatEra } from "@app/utils/formatStats";
import {
  normalizeBattingStats,
  normalizePitchingStats,
} from "./radarChartUtils";
import StatsRadarChart from "./StatsRadarChart";

interface StatsOverviewProps {
  battingStats: BattingStats | null;
  pitchingStats: PitchingStats | null;
  hasBattingRecord: boolean;
  hasPitchingRecord: boolean;
  availableYears: number[];
  availableMonths: string[];
  availableSeasons: SeasonOption[];
  availableTournaments: TournamentOption[];
  onBattingFilterChange: (
    year: string,
    matchType: string,
    seasonId?: string,
    tournamentId?: string,
    startMonth?: string,
    endMonth?: string,
  ) => void;
  onPitchingFilterChange: (
    year: string,
    matchType: string,
    seasonId?: string,
    tournamentId?: string,
    startMonth?: string,
    endMonth?: string,
  ) => void;
}

const MATCH_TYPE_OPTIONS = [
  { key: "全て", label: "全て" },
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];

function calcTotalHits(agg: BattingStats["aggregate"]): number {
  return (
    (agg?.hit ?? 0) +
    (agg?.two_base_hit ?? 0) +
    (agg?.three_base_hit ?? 0) +
    (agg?.home_run ?? 0)
  );
}

const displayValue = (value: number | undefined | null) =>
  value == null ? "-" : value.toString();
const displayFormattedValue = (value: number | undefined | null) =>
  value == null ? "-" : formatRate(value);
const displayEraValue = (value: number | undefined | null) =>
  value == null ? "-" : formatEra(value);
const displayFormattedValue2 = (value: number | undefined | null) =>
  value == null ? "-" : formatRate2(value);

const styleTableBox = "grid grid-cols-2 text-center";
const styleTableTitle =
  "border-r-1 border-b-1 border-r-zinc-500 border-b-zinc-500 text-sm py-2.5 font-normal text-zinc-300";
const styleTableData =
  "bg-sub text-sm py-2.5 font-medium border-b-1 border-b-zinc-500";

interface FilterProps {
  availableYears: { key: string; label: string }[];
  availableSeasons: { key: string; label: string }[];
  availableTournaments: { key: string; label: string }[];
  monthOptions: MonthOption[];
  selectedYear: string;
  selectedMatchType: string;
  selectedSeason: string;
  selectedTournament: string;
  startMonth?: string;
  endMonth?: string;
  onYearChange: (key: string) => void;
  onMatchTypeChange: (key: string) => void;
  onSeasonChange: (key: string) => void;
  onTournamentChange: (key: string) => void;
  onPeriodRangeChange: (range: PeriodRange) => void;
}

function StatsFilter({
  availableYears,
  availableSeasons,
  availableTournaments,
  monthOptions,
  selectedYear,
  selectedMatchType,
  selectedSeason,
  selectedTournament,
  startMonth,
  endMonth,
  onYearChange,
  onMatchTypeChange,
  onSeasonChange,
  onTournamentChange,
  onPeriodRangeChange,
}: FilterProps) {
  return (
    <FilterChipGroup wrap>
      <FilterChip
        label="年度"
        value={selectedYear}
        defaultValue="通算"
        options={availableYears}
        onChange={onYearChange}
      />
      <FilterChip
        label="種別"
        value={selectedMatchType}
        defaultValue="全て"
        options={MATCH_TYPE_OPTIONS}
        onChange={onMatchTypeChange}
      />
      {availableSeasons.length > 1 && (
        <FilterChip
          label="シーズン"
          value={selectedSeason}
          defaultValue="全て"
          options={availableSeasons}
          onChange={onSeasonChange}
        />
      )}
      {availableTournaments.length > 1 && (
        <FilterChip
          label="大会"
          value={selectedTournament}
          defaultValue="全て"
          options={availableTournaments}
          onChange={onTournamentChange}
        />
      )}
      <PeriodRangeFilter
        startMonth={startMonth}
        endMonth={endMonth}
        monthOptions={monthOptions}
        onChange={onPeriodRangeChange}
      />
    </FilterChipGroup>
  );
}

function BattingSummary({ battingStats }: { battingStats: BattingStats }) {
  const agg = battingStats.aggregate;
  const calc = battingStats.calculated;
  const matches = agg?.number_of_matches ?? 0;
  const avg = calc?.batting_average ?? 0;
  const timesAtBat = agg?.times_at_bat ?? 0;
  const atBats = agg?.at_bats ?? 0;
  const totalHits = calcTotalHits(agg);
  const rbi = agg?.runs_batted_in ?? 0;
  const hr = agg?.home_run ?? 0;

  return (
    <div className="mb-2 py-2">
      <p>
        <span className="text-sm text-zinc-200">打率</span>
        <span className="text-xl font-bold ml-1" style={{ color: "#d08000" }}>
          {formatRate(avg)}
        </span>
        <span className="text-sm text-zinc-200 ml-3">{matches}試合</span>
      </p>
      <p className="text-sm text-zinc-300 mt-0.5">
        {timesAtBat}打席 {atBats}打数 {totalHits}安打 / {rbi}打点 {hr}本塁打
      </p>
    </div>
  );
}

function PitchingSummary({ pitchingStats }: { pitchingStats: PitchingStats }) {
  const agg = pitchingStats.aggregate;
  const calc = pitchingStats.calculated;
  const appearances = agg?.number_of_appearances ?? 0;
  const era = calc?.era ?? 0;
  const ip = agg?.innings_pitched ?? 0;
  const wins = agg?.win ?? 0;
  const losses = agg?.loss ?? 0;
  const strikeouts = agg?.strikeouts ?? 0;

  return (
    <div className="mb-2 py-2">
      <p>
        <span className="text-sm text-zinc-200">防御率</span>
        <span className="text-xl font-bold ml-1" style={{ color: "#338EF7" }}>
          {formatEra(era)}
        </span>
        <span className="text-sm text-zinc-200 ml-3">{appearances}登板</span>
      </p>
      <p className="text-sm text-zinc-300 mt-0.5">
        {ip}回 {wins}勝{losses}敗 / {strikeouts}奪三振
      </p>
    </div>
  );
}

function BattingTable({ battingStats }: { battingStats: BattingStats }) {
  const agg = battingStats.aggregate;
  const calc = battingStats.calculated;
  const totalHits = calc ? calcTotalHits(agg) : null;

  return (
    <div className="border-x-1 border-t-1 border-zinc-500 rounded-md overflow-hidden">
      <div className="grid grid-cols-2">
        <div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打率</p>
            <span className={styleTableData}>
              {displayFormattedValue(calc?.batting_average)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打席</p>
            <span className={styleTableData}>
              {displayValue(agg?.times_at_bat)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>安打</p>
            <span className={styleTableData}>{displayValue(totalHits)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>三塁打</p>
            <span className={styleTableData}>
              {displayValue(agg?.three_base_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>塁打</p>
            <span className={styleTableData}>
              {displayValue(agg?.total_bases)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>得点</p>
            <span className={styleTableData}>{displayValue(agg?.run)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>四球</p>
            <span className={styleTableData}>
              {displayValue(agg?.base_on_balls)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>犠打</p>
            <span className={styleTableData}>
              {displayValue(agg?.sacrifice_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>盗塁</p>
            <span className={styleTableData}>
              {displayValue(agg?.stealing_base)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>出塁率</p>
            <span className={styleTableData}>
              {displayFormattedValue(calc?.on_base_percentage)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>OPS</p>
            <span className={styleTableData}>
              {displayFormattedValue(calc?.ops)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={`${styleTableTitle} rounded-bl-md`}>ISOD</p>
            <span className={styleTableData}>
              {displayFormattedValue(calc?.isod)}
            </span>
          </div>
        </div>

        <div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>試合</p>
            <span className={styleTableData}>
              {displayValue(agg?.number_of_matches)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打数</p>
            <span className={styleTableData}>{displayValue(agg?.at_bats)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>二塁打</p>
            <span className={styleTableData}>
              {displayValue(agg?.two_base_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>本塁打</p>
            <span className={styleTableData}>
              {displayValue(agg?.home_run)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>打点</p>
            <span className={styleTableData}>
              {displayValue(agg?.runs_batted_in)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>三振</p>
            <span className={styleTableData}>
              {displayValue(agg?.strike_out)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>死球</p>
            <span className={styleTableData}>
              {displayValue(agg?.hit_by_pitch)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>犠飛</p>
            <span className={styleTableData}>
              {displayValue(agg?.sacrifice_fly)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>盗塁死</p>
            <span className={styleTableData}>
              {displayValue(agg?.caught_stealing)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>長打率</p>
            <span className={styleTableData}>
              {displayFormattedValue(calc?.slugging_percentage)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>ISO</p>
            <span className={styleTableData}>
              {displayFormattedValue(calc?.iso)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>BB/K</p>
            <span className={`${styleTableData} rounded-br-md`}>
              {displayFormattedValue(calc?.bb_per_k)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PitchingTable({ pitchingStats }: { pitchingStats: PitchingStats }) {
  const agg = pitchingStats.aggregate;
  const calc = pitchingStats.calculated;

  return (
    <div className="border-x-1 border-t-1 border-zinc-500 rounded-md overflow-hidden">
      <div className="grid grid-cols-2">
        <div>
          <div className={styleTableBox}>
            <StatTooltipLabel
              label="防御率"
              tooltip={INNING_FORMAT_TOOLTIP}
              className={styleTableTitle}
            />
            <span className={styleTableData}>{displayEraValue(calc?.era)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>勝利</p>
            <span className={styleTableData}>{displayValue(agg?.win)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>ホールド</p>
            <span className={styleTableData}>{displayValue(agg?.hold)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>完投</p>
            <span className={styleTableData}>
              {displayValue(agg?.complete_games)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>勝率</p>
            <span className={styleTableData}>
              {displayFormattedValue2(calc?.win_percentage)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>失点</p>
            <span className={styleTableData}>
              {displayValue(agg?.run_allowed)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>被安打</p>
            <span className={styleTableData}>
              {displayValue(agg?.hits_allowed)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>奪三振</p>
            <span className={styleTableData}>
              {displayValue(agg?.strikeouts)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>与四球</p>
            <span className={styleTableData}>
              {displayValue(agg?.base_on_balls)}
            </span>
          </div>
          <div className={styleTableBox}>
            <StatTooltipLabel
              label="BB/9"
              tooltip={INNING_FORMAT_TOOLTIP}
              className={styleTableTitle}
            />
            <span className={styleTableData}>
              {displayEraValue(calc?.bb_per_nine)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={`${styleTableTitle} rounded-bl-md`}>WHIP</p>
            <span className={styleTableData}>
              {displayEraValue(calc?.whip)}
            </span>
          </div>
        </div>
        <div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>登板</p>
            <span className={styleTableData}>
              {displayValue(agg?.number_of_appearances)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>敗戦</p>
            <span className={styleTableData}>{displayValue(agg?.loss)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>セーブ</p>
            <span className={styleTableData}>{displayValue(agg?.saves)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>完封</p>
            <span className={styleTableData}>
              {displayValue(agg?.shutouts)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>投球回</p>
            <span className={styleTableData}>
              {displayValue(agg?.innings_pitched)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>自責点</p>
            <span className={styleTableData}>
              {displayValue(agg?.earned_run)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>被本塁打</p>
            <span className={styleTableData}>
              {displayValue(agg?.home_runs_hit)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>与死球</p>
            <span className={styleTableData}>
              {displayValue(agg?.hit_by_pitch)}
            </span>
          </div>
          <div className={styleTableBox}>
            <StatTooltipLabel
              label="K/9"
              tooltip={INNING_FORMAT_TOOLTIP}
              className={styleTableTitle}
            />
            <span className={styleTableData}>
              {displayEraValue(calc?.k_per_nine)}
            </span>
          </div>
          <div className={styleTableBox}>
            <p className={styleTableTitle}>K/BB</p>
            <span className={styleTableData}>{displayValue(calc?.k_bb)}</span>
          </div>
          <div className={styleTableBox}>
            <p className={`${styleTableTitle} rounded-bl-md`}>総投球数</p>
            <span className={`${styleTableData} rounded-br-md`}>
              {displayValue(agg?.number_of_pitches)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsOverview({
  battingStats,
  pitchingStats,
  hasBattingRecord,
  hasPitchingRecord,
  availableYears,
  availableMonths,
  availableSeasons,
  availableTournaments,
  onBattingFilterChange,
  onPitchingFilterChange,
}: StatsOverviewProps) {
  const [battingYear, setBattingYear] = useState("通算");
  const [battingMatchType, setBattingMatchType] = useState("全て");
  const [battingSeason, setBattingSeason] = useState("全て");
  const [battingTournament, setBattingTournament] = useState("全て");
  const [battingStartMonth, setBattingStartMonth] = useState<
    string | undefined
  >(undefined);
  const [battingEndMonth, setBattingEndMonth] = useState<string | undefined>(
    undefined,
  );
  const [pitchingYear, setPitchingYear] = useState("通算");
  const [pitchingMatchType, setPitchingMatchType] = useState("全て");
  const [pitchingSeason, setPitchingSeason] = useState("全て");
  const [pitchingTournament, setPitchingTournament] = useState("全て");
  const [pitchingStartMonth, setPitchingStartMonth] = useState<
    string | undefined
  >(undefined);
  const [pitchingEndMonth, setPitchingEndMonth] = useState<string | undefined>(
    undefined,
  );

  const yearOptions = [
    { key: "通算", label: "通算" },
    ...availableYears.map((y) => ({ key: String(y), label: `${y}年` })),
  ];

  const seasonOptions = [
    { key: "全て", label: "全て" },
    ...availableSeasons.map((s) => ({ key: String(s.id), label: s.name })),
  ];

  const tournamentOptions = [
    { key: "全て", label: "全て" },
    ...availableTournaments.map((t) => ({ key: String(t.id), label: t.name })),
  ];

  const monthOptions: MonthOption[] = monthOptionsFromRecorded(availableMonths);

  const battingTournamentId =
    battingTournament !== "全て" ? battingTournament : undefined;

  const handleBattingYearChange = (year: string) => {
    setBattingYear(year);
    // 実年を選んだら期間指定をクリアする（年度と期間は排他）。
    const isRealYear = year !== "通算";
    const nextStartMonth = isRealYear ? undefined : battingStartMonth;
    const nextEndMonth = isRealYear ? undefined : battingEndMonth;
    if (isRealYear) {
      setBattingStartMonth(undefined);
      setBattingEndMonth(undefined);
    }
    const seasonId = battingSeason !== "全て" ? battingSeason : undefined;
    onBattingFilterChange(
      year,
      battingMatchType,
      seasonId,
      battingTournamentId,
      nextStartMonth,
      nextEndMonth,
    );
  };

  const handleBattingMatchTypeChange = (matchType: string) => {
    setBattingMatchType(matchType);
    const seasonId = battingSeason !== "全て" ? battingSeason : undefined;
    onBattingFilterChange(
      battingYear,
      matchType,
      seasonId,
      battingTournamentId,
      battingStartMonth,
      battingEndMonth,
    );
  };

  const handleBattingSeasonChange = (season: string) => {
    setBattingSeason(season);
    const seasonId = season !== "全て" ? season : undefined;
    onBattingFilterChange(
      battingYear,
      battingMatchType,
      seasonId,
      battingTournamentId,
      battingStartMonth,
      battingEndMonth,
    );
  };

  const handleBattingTournamentChange = (tournament: string) => {
    setBattingTournament(tournament);
    const tournamentId = tournament !== "全て" ? tournament : undefined;
    const seasonId = battingSeason !== "全て" ? battingSeason : undefined;
    onBattingFilterChange(
      battingYear,
      battingMatchType,
      seasonId,
      tournamentId,
      battingStartMonth,
      battingEndMonth,
    );
  };

  const handleBattingPeriodRangeChange = (range: PeriodRange) => {
    setBattingStartMonth(range.startMonth);
    setBattingEndMonth(range.endMonth);
    // 期間を指定したら年度は通算に戻す（年度と期間は排他）。
    const hasPeriod = !!(range.startMonth || range.endMonth);
    const nextYear = hasPeriod ? "通算" : battingYear;
    if (hasPeriod) setBattingYear("通算");
    const seasonId = battingSeason !== "全て" ? battingSeason : undefined;
    onBattingFilterChange(
      nextYear,
      battingMatchType,
      seasonId,
      battingTournamentId,
      range.startMonth,
      range.endMonth,
    );
  };

  const pitchingTournamentId =
    pitchingTournament !== "全て" ? pitchingTournament : undefined;

  const handlePitchingYearChange = (year: string) => {
    setPitchingYear(year);
    const isRealYear = year !== "通算";
    const nextStartMonth = isRealYear ? undefined : pitchingStartMonth;
    const nextEndMonth = isRealYear ? undefined : pitchingEndMonth;
    if (isRealYear) {
      setPitchingStartMonth(undefined);
      setPitchingEndMonth(undefined);
    }
    const seasonId = pitchingSeason !== "全て" ? pitchingSeason : undefined;
    onPitchingFilterChange(
      year,
      pitchingMatchType,
      seasonId,
      pitchingTournamentId,
      nextStartMonth,
      nextEndMonth,
    );
  };

  const handlePitchingMatchTypeChange = (matchType: string) => {
    setPitchingMatchType(matchType);
    const seasonId = pitchingSeason !== "全て" ? pitchingSeason : undefined;
    onPitchingFilterChange(
      pitchingYear,
      matchType,
      seasonId,
      pitchingTournamentId,
      pitchingStartMonth,
      pitchingEndMonth,
    );
  };

  const handlePitchingSeasonChange = (season: string) => {
    setPitchingSeason(season);
    const seasonId = season !== "全て" ? season : undefined;
    onPitchingFilterChange(
      pitchingYear,
      pitchingMatchType,
      seasonId,
      pitchingTournamentId,
      pitchingStartMonth,
      pitchingEndMonth,
    );
  };

  const handlePitchingTournamentChange = (tournament: string) => {
    setPitchingTournament(tournament);
    const tournamentId = tournament !== "全て" ? tournament : undefined;
    const seasonId = pitchingSeason !== "全て" ? pitchingSeason : undefined;
    onPitchingFilterChange(
      pitchingYear,
      pitchingMatchType,
      seasonId,
      tournamentId,
      pitchingStartMonth,
      pitchingEndMonth,
    );
  };

  const handlePitchingPeriodRangeChange = (range: PeriodRange) => {
    setPitchingStartMonth(range.startMonth);
    setPitchingEndMonth(range.endMonth);
    const hasPeriod = !!(range.startMonth || range.endMonth);
    const nextYear = hasPeriod ? "通算" : pitchingYear;
    if (hasPeriod) setPitchingYear("通算");
    const seasonId = pitchingSeason !== "全て" ? pitchingSeason : undefined;
    onPitchingFilterChange(
      nextYear,
      pitchingMatchType,
      seasonId,
      pitchingTournamentId,
      range.startMonth,
      range.endMonth,
    );
  };

  const hasBattingData = !!battingStats?.calculated;
  const hasPitchingData = !!pitchingStats?.calculated;
  const hasStats = hasBattingRecord || hasPitchingRecord;

  return (
    <section>
      <h3 className="text-lg font-bold mb-3">成績</h3>

      {!hasStats ? (
        <div className="rounded-lg border border-zinc-700 p-6 text-center">
          <p className="text-zinc-400">成績がありません</p>
          <p className="text-zinc-500 text-sm mt-1">
            試合を記録すると成績が表示されます
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {hasBattingRecord && (
            <div>
              {hasBattingData && battingStats && (
                <div className="flex justify-center">
                  <StatsRadarChart
                    data={normalizeBattingStats(battingStats)}
                    color="#d08000"
                    title="打撃"
                  />
                </div>
              )}
              <div className="flex items-center justify-between mb-2 gap-2 overflow-hidden">
                <h4 className="text-sm font-semibold text-zinc-400 shrink-0 whitespace-nowrap">
                  打撃成績
                </h4>
                <StatsFilter
                  availableYears={yearOptions}
                  availableSeasons={seasonOptions}
                  availableTournaments={tournamentOptions}
                  monthOptions={monthOptions}
                  selectedYear={battingYear}
                  selectedMatchType={battingMatchType}
                  selectedSeason={battingSeason}
                  selectedTournament={battingTournament}
                  startMonth={battingStartMonth}
                  endMonth={battingEndMonth}
                  onYearChange={handleBattingYearChange}
                  onMatchTypeChange={handleBattingMatchTypeChange}
                  onSeasonChange={handleBattingSeasonChange}
                  onTournamentChange={handleBattingTournamentChange}
                  onPeriodRangeChange={handleBattingPeriodRangeChange}
                />
              </div>
              {hasBattingData && battingStats && (
                <BattingSummary battingStats={battingStats} />
              )}
              {hasBattingData && battingStats ? (
                <BattingTable battingStats={battingStats} />
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">
                  該当する打撃成績がありません
                </p>
              )}
            </div>
          )}

          {hasPitchingRecord && (
            <div>
              {hasPitchingData && pitchingStats && (
                <div className="flex justify-center">
                  <StatsRadarChart
                    data={normalizePitchingStats(pitchingStats)}
                    color="#338EF7"
                    title="投手"
                  />
                </div>
              )}
              <div className="flex items-center justify-between mb-2 gap-2 overflow-hidden">
                <h4 className="text-sm font-semibold text-zinc-400 shrink-0 whitespace-nowrap">
                  投手成績
                </h4>
                <StatsFilter
                  availableYears={yearOptions}
                  availableSeasons={seasonOptions}
                  availableTournaments={tournamentOptions}
                  monthOptions={monthOptions}
                  selectedYear={pitchingYear}
                  selectedMatchType={pitchingMatchType}
                  selectedSeason={pitchingSeason}
                  selectedTournament={pitchingTournament}
                  startMonth={pitchingStartMonth}
                  endMonth={pitchingEndMonth}
                  onYearChange={handlePitchingYearChange}
                  onMatchTypeChange={handlePitchingMatchTypeChange}
                  onSeasonChange={handlePitchingSeasonChange}
                  onTournamentChange={handlePitchingTournamentChange}
                  onPeriodRangeChange={handlePitchingPeriodRangeChange}
                />
              </div>
              {hasPitchingData && pitchingStats && (
                <PitchingSummary pitchingStats={pitchingStats} />
              )}
              {hasPitchingData && pitchingStats ? (
                <PitchingTable pitchingStats={pitchingStats} />
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">
                  該当する投手成績がありません
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
