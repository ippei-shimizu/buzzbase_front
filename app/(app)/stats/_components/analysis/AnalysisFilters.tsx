"use client";
import type { AnalysisFilters as Filters } from "../../analysisActions";

interface AnalysisFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  years: string[];
}

const MATCH_TYPES: { value: string; label: string }[] = [
  { value: "", label: "全試合" },
  { value: "regular", label: "公式戦" },
  { value: "open", label: "オープン戦" },
];

/** 分析の絞り込み（年 / 試合種別）。 */
export function AnalysisFilters({
  filters,
  onChange,
  years,
}: AnalysisFiltersProps) {
  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-wrap gap-2">
        {MATCH_TYPES.map((option) => {
          const isSelected = (filters.matchType ?? "") === option.value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-600 text-zinc-200"
              }`}
              onClick={() => onChange({ ...filters, matchType: option.value })}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {years.map((year) => {
          const isSelected = (filters.year ?? "通算") === year;
          return (
            <button
              key={year}
              type="button"
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-600 text-zinc-200"
              }`}
              onClick={() => onChange({ ...filters, year })}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
