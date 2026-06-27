// 成績画面のフィルタ選択肢の型と既定値。
// server（filterOptions.ts）/ client（各コンテナ）双方から import するため、
// next/headers 等のサーバー専用 API は持たせない。
export interface FilterOption {
  key: string;
  label: string;
}

/** シーズン/大会フィルタの既定（未絞り込み）選択肢。 */
export const DEFAULT_OPTION: FilterOption = { key: "全て", label: "全て" };
