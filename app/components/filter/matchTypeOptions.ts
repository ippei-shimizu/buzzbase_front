import type { FilterOption } from "./filterTypes";

/** 試合種別チップの選択肢。key はバックエンドの match_type 値。 */
export const MATCH_TYPE_OPTIONS: FilterOption[] = [
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];
