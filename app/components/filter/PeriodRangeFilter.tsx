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
 * 期間（開始年月〜終了年月）の絞り込み。開始 / 終了それぞれを月ドロップダウンで選ぶ。
 * 開始が終了より後になった場合は終了を開始に合わせてクランプし、逆転レンジを防ぐ。
 * 「指定なし」を選ぶとその端は開放端（undefined）になる。
 */
export default function PeriodRangeFilter({
  startMonth,
  endMonth,
  monthOptions,
  onChange,
}: PeriodRangeFilterProps) {
  const handleStartChange = (key: string) => {
    const nextStart = key || undefined;
    // 開始 > 終了 になったら終了を開始へクランプ（"YYYY-MM" は文字列比較で時系列順）
    const nextEnd =
      nextStart && endMonth && endMonth < nextStart ? nextStart : endMonth;
    onChange({ startMonth: nextStart, endMonth: nextEnd });
  };

  const handleEndChange = (key: string) => {
    const nextEnd = key || undefined;
    const nextStart =
      nextEnd && startMonth && startMonth > nextEnd ? nextEnd : startMonth;
    onChange({ startMonth: nextStart, endMonth: nextEnd });
  };

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
