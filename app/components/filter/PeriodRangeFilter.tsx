"use client";

import FilterChip from "@app/components/filter/FilterChip";
import {
  UNSET_MONTH_OPTION,
  type MonthOption,
} from "@app/utils/buildMonthOptions";

export interface PeriodRange {
  startMonth?: string;
  endMonth?: string;
}

interface PeriodRangeFilterProps {
  startMonth?: string;
  endMonth?: string;
  monthOptions: MonthOption[];
  onChange: (range: PeriodRange) => void;
}

/**
 * 開始月を選んだときの新しいレンジを返す。
 * 終了が未指定、または開始より前になっている場合は終了を開始へ合わせる。
 * 終了未指定→同月補完により、開始を選ぶだけで単月がワンタップで作れる。
 * ("YYYY-MM" は文字列比較で時系列順になる)
 */
export function resolveStartChange(
  key: string,
  endMonth?: string,
): PeriodRange {
  const startMonth = key || undefined;
  if (!startMonth) return { startMonth: undefined, endMonth };

  const nextEnd = !endMonth || endMonth < startMonth ? startMonth : endMonth;
  return { startMonth, endMonth: nextEnd };
}

/**
 * 終了月を選んだときの新しいレンジを返す。
 * 開始が終了より後の場合のみ開始を終了へクランプする（逆転レンジ防止）。
 * 開始が未指定なら補完しない（「〜指定月まで」の開放端を保てるようにする）。
 */
export function resolveEndChange(
  key: string,
  startMonth?: string,
): PeriodRange {
  const endMonth = key || undefined;
  if (!endMonth) return { startMonth, endMonth: undefined };

  const nextStart = startMonth && startMonth > endMonth ? endMonth : startMonth;
  return { startMonth: nextStart, endMonth };
}

/**
 * 期間（開始年月〜終了年月）の絞り込み。開始 / 終了それぞれを月ドロップダウンで選ぶ。
 * 開始だけ選ぶと終了も同月に補完され単月になる。「指定なし」を選ぶとその端は開放端になる。
 */
export default function PeriodRangeFilter({
  startMonth,
  endMonth,
  monthOptions,
  onChange,
}: PeriodRangeFilterProps) {
  const handleStartChange = (key: string) =>
    onChange(resolveStartChange(key, endMonth));

  const handleEndChange = (key: string) =>
    onChange(resolveEndChange(key, startMonth));

  return (
    <>
      <FilterChip
        label="開始"
        value={startMonth ?? UNSET_MONTH_OPTION.key}
        defaultValue={UNSET_MONTH_OPTION.key}
        options={monthOptions}
        onChange={handleStartChange}
      />
      <FilterChip
        label="終了"
        value={endMonth ?? UNSET_MONTH_OPTION.key}
        defaultValue={UNSET_MONTH_OPTION.key}
        options={monthOptions}
        onChange={handleEndChange}
      />
    </>
  );
}
