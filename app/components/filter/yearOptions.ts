import type { FilterOption } from "./filterTypes";

/**
 * 直近 `count` 年分の年度選択肢を新しい順で作る。
 * 記録のある年をサーバーから取れない画面向けのフォールバック。
 */
export function buildRecentYearOptions(count = 6): FilterOption[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, offset) => {
    const year = String(currentYear - offset);
    return { key: year, label: year };
  });
}

/** 記録のある年（バックエンドの available_years）を年度選択肢に変換する。 */
export function yearOptionsFrom(years: (number | string)[]): FilterOption[] {
  return years.map((year) => ({ key: String(year), label: String(year) }));
}
