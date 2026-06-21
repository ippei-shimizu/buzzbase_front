"use client";
import type { AnalysisFilters as Filters } from "../../analysisActions";
import FilterChip from "@app/components/filter/FilterChip";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";

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
}

const MATCH_TYPE_OPTIONS: FilterOption[] = [
  { key: "全て", label: "全て" },
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];

/** 分析の絞り込み（年度 / 種別 / シーズン / 大会）。共通の FilterChip を使う。 */
export function AnalysisFilters({
  filters,
  onChange,
  yearOptions,
  seasonOptions,
  tournamentOptions,
}: AnalysisFiltersProps) {
  return (
    <FilterChipGroup>
      <FilterChip
        label="年度"
        value={filters.year ?? "通算"}
        defaultValue="通算"
        options={yearOptions}
        onChange={(key) => onChange({ ...filters, year: key })}
      />
      <FilterChip
        label="種別"
        value={filters.matchType ? filters.matchType : "全て"}
        defaultValue="全て"
        options={MATCH_TYPE_OPTIONS}
        onChange={(key) =>
          onChange({ ...filters, matchType: key === "全て" ? "" : key })
        }
      />
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
    </FilterChipGroup>
  );
}
