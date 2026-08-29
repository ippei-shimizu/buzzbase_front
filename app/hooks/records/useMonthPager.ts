"use client";

import { useState } from "react";
import { collectMonths, itemsInMonth } from "@app/utils/recordListFilter";

interface MonthPagerState<T> {
  /** 記録がある年月（`YYYY-MM`）を新しい順に並べたもの。記録の無い月は挟まない。 */
  months: string[];
  /** 表示中の月の位置。0 が最新月。 */
  index: number;
  /** 表示中の年月。記録が1件も無ければ null。 */
  month: string | null;
  /** 表示中の月に属する記録。 */
  items: T[];
  goTo: (index: number) => void;
  /** 最新月へ戻す。絞り込みを変えたときに呼ぶ。 */
  reset: () => void;
}

/**
 * 記録がある月だけを1ページとして送る月ページング。
 *
 * 絞り込みで月の並びが短くなっても範囲外を指さないよう、保持したページ番号は
 * 描画時に丸める（state は書き換えないので、絞り込みを戻せば元のページに復帰する）。
 */
export function useMonthPager<T>(
  items: T[],
  dateOf: (item: T) => string,
): MonthPagerState<T> {
  const [index, setIndex] = useState(0);

  const months = collectMonths(items, dateOf);
  const safeIndex = Math.min(index, Math.max(months.length - 1, 0));
  const month = months[safeIndex] ?? null;

  return {
    months,
    index: safeIndex,
    month,
    items: month ? itemsInMonth(items, dateOf, month) : [],
    goTo: setIndex,
    reset: () => setIndex(0),
  };
}
