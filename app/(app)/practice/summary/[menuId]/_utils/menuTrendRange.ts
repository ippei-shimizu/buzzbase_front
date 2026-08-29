import type { MenuTrend, MenuTrendBucket } from "@app/types/practice";
import { formatTotalAmount, formatVolume } from "@app/constants/practice";
import { TREND_DAY_LIMIT } from "../_components/menuTrendCopy";

/** 集計の粒度。back のレスポンス（by_year / by_month / by_day）に1対1で対応する。 */
export type TrendPeriod = "year" | "month" | "day";

export const TREND_PERIOD_TABS: ReadonlyArray<{
  key: TrendPeriod;
  label: string;
}> = [
  { key: "year", label: "年別" },
  { key: "month", label: "月別" },
  { key: "day", label: "日別" },
];

export interface TrendRangeOption {
  label: string;
  /** 表示するバケット数（新しい順）。null は全期間。 */
  limit: number | null;
}

/** 粒度ごとの表示レンジ。mobile の推移画面と同じ選択肢に揃える。 */
export const TREND_RANGE_OPTIONS: Readonly<
  Record<TrendPeriod, readonly TrendRangeOption[]>
> = {
  year: [
    { label: "3年", limit: 3 },
    { label: "5年", limit: 5 },
    { label: "全期間", limit: null },
  ],
  month: [
    { label: "6ヶ月", limit: 6 },
    { label: "1年", limit: 12 },
    { label: "2年", limit: 24 },
    { label: "全期間", limit: null },
  ],
  day: [
    { label: "2週間", limit: 14 },
    { label: "1ヶ月", limit: 30 },
    { label: "3ヶ月", limit: 90 },
    { label: "全期間", limit: null },
  ],
};

/** 粒度を切り替えたときに選ばれるレンジ。粒度ごとに選択肢が違うため個別に持つ。 */
export const TREND_DEFAULT_RANGE_INDEX: Readonly<Record<TrendPeriod, number>> =
  {
    year: 2,
    month: 1,
    day: 1,
  };

/** 粒度に対応するバケット配列（新しい順）を取り出す。 */
export const bucketsForPeriod = (
  trend: MenuTrend,
  period: TrendPeriod,
): MenuTrendBucket[] => {
  if (period === "year") return trend.by_year ?? [];
  if (period === "month") return trend.by_month ?? [];
  return trend.by_day ?? [];
};

/**
 * レンジで直近 limit 件に絞る。バケットは新しい順で届くため先頭から取る。
 * @param limit null なら絞り込まない（全期間）
 */
export const sliceByRange = (
  buckets: MenuTrendBucket[],
  limit: number | null,
): MenuTrendBucket[] => (limit === null ? buckets : buckets.slice(0, limit));

/** グラフに描く値。筋トレは総挙上重量、それ以外は量そのもの。 */
export const bucketValue = (
  trend: MenuTrend,
  bucket: MenuTrendBucket,
): number =>
  trend.menu.is_weight_reps ? bucket.total_volume : bucket.total_amount;

/** 一覧・ツールチップに出す値。筋トレは「8.2t」、それ以外は「200本」。 */
export const bucketValueText = (
  trend: MenuTrend,
  bucket: MenuTrendBucket,
): string =>
  trend.menu.is_weight_reps
    ? formatVolume(bucket.total_volume)
    : formatTotalAmount(bucket.total_amount, trend.menu.unit_label);

/** back の period（"2026" / "2026-08" / "2026-08-03"）を表示ラベルにする。 */
export const periodLabel = (period: TrendPeriod, value: string): string => {
  const [year, month, day] = value.split("-");
  if (period === "year") return `${year}年`;
  if (period === "month") return `${Number(year)}/${Number(month)}`;
  return `${Number(month)}/${Number(day)}`;
};

/**
 * 日別が back の上限（60 件）に達しているか。
 * 上限に達していると、より広いレンジを選んでも表示件数が増えないため注記を出す。
 */
export const isDayLimitReached = (
  period: TrendPeriod,
  buckets: MenuTrendBucket[],
): boolean => period === "day" && buckets.length >= TREND_DAY_LIMIT;
