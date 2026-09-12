import type { FilterValues } from "./filterTypes";
import { trackStatsFilterChanged } from "@app/utils/analytics";
import { FILTER_KEYS } from "./filterTypes";

/**
 * 絞り込みの変更を計測する。どの絞り込みが使われるかを見るため、
 * 変更されたキーだけを 1 件ずつ送る（解除は値 null で送る）。
 */
export function trackFilterChanges(
  previous: FilterValues,
  next: FilterValues,
): void {
  for (const key of FILTER_KEYS) {
    if (previous[key] !== next[key]) {
      trackStatsFilterChanged({
        filter_key: key,
        filter_value: next[key] ?? null,
      });
    }
  }
}
