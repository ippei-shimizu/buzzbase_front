"use client";

import ChevronLeftIcon from "@heroicons/react/24/outline/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import { formatMonthCountLabel } from "@app/utils/recordListFilter";

interface MonthPaginatorProps {
  /** 表示中の年月（`YYYY-MM`）。 */
  month: string;
  /** 表示中の月に含まれる件数。 */
  count: number;
  /** 表示中の月の位置。0 が最新月。 */
  index: number;
  /** 記録がある月の総数。 */
  total: number;
  onChange: (index: number) => void;
}

const NAV_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-full text-[#d08000] transition-colors hover:bg-[#3A3A3A] disabled:text-zinc-600 disabled:hover:bg-transparent";

/**
 * 記録がある月を1ページずつ送るナビゲーション（◀ 2026年7月（3件） ▶）。
 * 新しい月ほど index が小さいため、左（前の月）で index を増やす。
 */
export default function MonthPaginator({
  month,
  count,
  index,
  total,
  onChange,
}: MonthPaginatorProps) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-sub px-4 py-2.5">
      <button
        type="button"
        onClick={() => onChange(index + 1)}
        disabled={index >= total - 1}
        className={NAV_BUTTON_CLASS}
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden />
        <span className="sr-only">前の月</span>
      </button>
      <p className="text-sm font-bold text-white" aria-live="polite">
        {formatMonthCountLabel(month, count)}
      </p>
      <button
        type="button"
        onClick={() => onChange(index - 1)}
        disabled={index <= 0}
        className={NAV_BUTTON_CLASS}
      >
        <ChevronRightIcon className="h-5 w-5" aria-hidden />
        <span className="sr-only">次の月</span>
      </button>
    </div>
  );
}
