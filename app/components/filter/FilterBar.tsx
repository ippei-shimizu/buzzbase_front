"use client";

import type { FilterOption, FilterValues } from "./filterTypes";
import FilterChip from "./FilterChip";
import FilterChipGroup from "./FilterChipGroup";
import { ALL_FILTER_KEY, hasActiveFilter } from "./filterTypes";

/**
 * 表示する絞り込みチップの選択肢。空配列 / 未指定のチップは描画しない
 * （選べる候補が無いチップを出しても操作できないため）。
 * `years` 以外はすべて任意で、画面ごとに使うチップを選べる。
 */
export interface FilterBarOptions {
  years: FilterOption[];
  /** 記録のある年月。`monthOptionsFromRecorded` で作る。 */
  months?: FilterOption[];
  matchTypes?: FilterOption[];
  seasons?: FilterOption[];
  tournaments?: FilterOption[];
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  options: FilterBarOptions;
}

/**
 * 成績・試合一覧・グループ詳細で共通の絞り込みバー
 * （年度 / 開始月 / 終了月 / 種別 / シーズン / 大会 + クリア）。
 *
 * 年度と月範囲は排他で、どちらかを選ぶともう一方が解除される。
 * 開始月・終了月は逆転しないよう相互に補正する。
 */
export default function FilterBar({
  values,
  onChange,
  options,
}: FilterBarProps) {
  const { years, months, matchTypes, seasons, tournaments } = options;

  const handleYearChange = (key: string) => {
    if (key === ALL_FILTER_KEY) {
      onChange({ ...values, year: undefined });
      return;
    }
    onChange({
      ...values,
      year: key,
      startMonth: undefined,
      endMonth: undefined,
    });
  };

  // 開始を選ぶと終了が未指定 / 開始より前のとき終了を同月に合わせ、単月をワンタップで作れる。
  const handleStartMonthChange = (key: string) => {
    if (key === ALL_FILTER_KEY) {
      onChange({ ...values, startMonth: undefined });
      return;
    }
    const endMonth =
      !values.endMonth || values.endMonth < key ? key : values.endMonth;
    onChange({ ...values, startMonth: key, endMonth, year: undefined });
  };

  const handleEndMonthChange = (key: string) => {
    if (key === ALL_FILTER_KEY) {
      onChange({ ...values, endMonth: undefined });
      return;
    }
    const startMonth =
      values.startMonth && values.startMonth > key ? key : values.startMonth;
    onChange({ ...values, startMonth, endMonth: key, year: undefined });
  };

  return (
    <FilterChipGroup wrap>
      <OptionalFilterChip
        label="年度"
        allLabel="通算"
        value={values.year}
        options={years}
        onChange={handleYearChange}
      />
      <OptionalFilterChip
        label="開始"
        value={values.startMonth}
        options={months}
        onChange={handleStartMonthChange}
      />
      <OptionalFilterChip
        label="終了"
        value={values.endMonth}
        options={months}
        onChange={handleEndMonthChange}
      />
      <OptionalFilterChip
        label="種別"
        value={values.matchType}
        options={matchTypes}
        onChange={(key) =>
          onChange({
            ...values,
            matchType: key === ALL_FILTER_KEY ? undefined : key,
          })
        }
      />
      <OptionalFilterChip
        label="シーズン"
        value={values.seasonId}
        options={seasons}
        onChange={(key) =>
          onChange({
            ...values,
            seasonId: key === ALL_FILTER_KEY ? undefined : key,
          })
        }
      />
      <OptionalFilterChip
        label="大会"
        value={values.tournamentId}
        options={tournaments}
        onChange={(key) =>
          onChange({
            ...values,
            tournamentId: key === ALL_FILTER_KEY ? undefined : key,
          })
        }
      />
      {hasActiveFilter(values) ? (
        <button
          type="button"
          onClick={() => onChange({})}
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

interface OptionalFilterChipProps {
  label: string;
  /** 未選択（絞り込まない）ときに表示するラベル。 */
  allLabel?: string;
  value: string | undefined;
  options: FilterOption[] | undefined;
  onChange: (key: string) => void;
}

/** 選択肢がある場合だけチップを描画し、先頭に「絞り込まない」選択肢を足す。 */
function OptionalFilterChip({
  label,
  allLabel = "全て",
  value,
  options,
  onChange,
}: OptionalFilterChipProps) {
  if (!options || options.length === 0) return null;

  return (
    <FilterChip
      label={label}
      value={value ?? ALL_FILTER_KEY}
      defaultValue={ALL_FILTER_KEY}
      options={[{ key: ALL_FILTER_KEY, label: allLabel }, ...options]}
      onChange={onChange}
    />
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
