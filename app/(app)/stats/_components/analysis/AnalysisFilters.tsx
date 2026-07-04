"use client";
import type { AnalysisFilters as Filters } from "../../analysisActions";
import FilterChip from "@app/components/filter/FilterChip";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
import PeriodRangeFilter, {
  type PeriodRange,
} from "@app/components/filter/PeriodRangeFilter";
import { type MonthOption } from "@app/utils/buildMonthOptions";

interface FilterOption {
  key: string;
  label: string;
}

interface AnalysisFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  yearOptions: FilterOption[];
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
  monthOptions: MonthOption[];
  /** 種別フィルタを隠す（絞り込みに種別を使わない投手タブ向け）。 */
  hideMatchType?: boolean;
}

const MATCH_TYPE_OPTIONS: FilterOption[] = [
  { key: "全て", label: "全て" },
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];

/** フィルタが既定値から変化しているか（リセットボタンの表示判定に使う）。 */
function hasActiveFilter(filters: Filters): boolean {
  return (
    (filters.year ?? "通算") !== "通算" ||
    Boolean(filters.matchType) ||
    Boolean(filters.seasonId) ||
    Boolean(filters.tournamentId) ||
    Boolean(filters.startMonth) ||
    Boolean(filters.endMonth)
  );
}

/** 分析の絞り込み（年度 / 種別 / シーズン / 大会）。共通の FilterChip を使う。 */
export function AnalysisFilters({
  filters,
  onChange,
  yearOptions,
  seasonOptions,
  tournamentOptions,
  monthOptions,
  hideMatchType = false,
}: AnalysisFiltersProps) {
  const handleReset = () =>
    onChange({
      year: "通算",
      matchType: "",
      seasonId: undefined,
      tournamentId: undefined,
      startMonth: undefined,
      endMonth: undefined,
    });

  // 年度と期間は排他。実年を選んだら期間を、期間を指定したら年度をクリアする。
  const handleYearChange = (key: string) =>
    onChange(
      key === "通算"
        ? { ...filters, year: key }
        : { ...filters, year: key, startMonth: undefined, endMonth: undefined },
    );

  const handlePeriodChange = (range: PeriodRange) => {
    const hasPeriod = Boolean(range.startMonth || range.endMonth);
    onChange({
      ...filters,
      startMonth: range.startMonth,
      endMonth: range.endMonth,
      year: hasPeriod ? "通算" : filters.year,
    });
  };

  return (
    <FilterChipGroup wrap>
      <FilterChip
        label="年度"
        value={filters.year ?? "通算"}
        defaultValue="通算"
        options={yearOptions}
        onChange={handleYearChange}
      />
      <PeriodRangeFilter
        startMonth={filters.startMonth}
        endMonth={filters.endMonth}
        monthOptions={monthOptions}
        onChange={handlePeriodChange}
      />
      {hideMatchType ? null : (
        <FilterChip
          label="種別"
          value={filters.matchType ? filters.matchType : "全て"}
          defaultValue="全て"
          options={MATCH_TYPE_OPTIONS}
          onChange={(key) =>
            onChange({ ...filters, matchType: key === "全て" ? "" : key })
          }
        />
      )}
      {seasonOptions.length > 1 ? (
        <FilterChip
          label="シーズン"
          value={filters.seasonId ?? "全て"}
          defaultValue="全て"
          options={seasonOptions}
          onChange={(key) =>
            onChange({ ...filters, seasonId: key === "全て" ? undefined : key })
          }
        />
      ) : null}
      {tournamentOptions.length > 1 ? (
        <FilterChip
          label="大会"
          value={filters.tournamentId ?? "全て"}
          defaultValue="全て"
          options={tournamentOptions}
          onChange={(key) =>
            onChange({
              ...filters,
              tournamentId: key === "全て" ? undefined : key,
            })
          }
        />
      ) : null}
      {hasActiveFilter(filters) ? (
        <button
          type="button"
          onClick={handleReset}
          aria-label="フィルターをクリア"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap px-2 py-1.5 text-xs font-medium text-[#A1A1AA]"
        >
          <RefreshIcon />
          クリア
        </button>
      ) : null}
    </FilterChipGroup>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
