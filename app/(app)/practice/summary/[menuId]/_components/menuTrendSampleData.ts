import type { MenuTrend, MenuTrendBucket } from "@app/types/practice";

const pad2 = (value: number): string => String(value).padStart(2, "0");

const yearPeriod = (base: Date, offsetFromNow: number): string =>
  String(base.getFullYear() - offsetFromNow);

const monthPeriod = (base: Date, offsetFromNow: number): string => {
  const date = new Date(base.getFullYear(), base.getMonth() - offsetFromNow, 1);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
};

const dayPeriod = (base: Date, offsetFromNow: number): string => {
  const date = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() - offsetFromNow,
  );
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

interface SampleShape {
  count: number;
  base: number;
  step: number;
  periodFor: (base: Date, offsetFromNow: number) => string;
  daysCountFor: (offsetFromNow: number, count: number) => number;
}

// メニュー・単位によらず同じ右肩上がりの例を見せる（mobile のサンプルと同じ形）。
const SAMPLE_SHAPES: Readonly<Record<"year" | "month" | "day", SampleShape>> = {
  year: {
    count: 3,
    base: 800,
    step: 700,
    periodFor: yearPeriod,
    daysCountFor: (offset, count) => 30 + (count - 1 - offset) * 15,
  },
  month: {
    count: 6,
    base: 80,
    step: 40,
    periodFor: monthPeriod,
    daysCountFor: (offset, count) => 8 + (count - 1 - offset),
  },
  day: {
    count: 14,
    base: 8,
    step: 4,
    periodFor: dayPeriod,
    daysCountFor: () => 1,
  },
};

// offsetFromNow=0 が最新。古いほど値を小さくして右肩上がりに見せる。
const buildBuckets = (shape: SampleShape, now: Date): MenuTrendBucket[] =>
  Array.from({ length: shape.count }, (_, offsetFromNow) => {
    const value = shape.base + shape.step * (shape.count - 1 - offsetFromNow);
    return {
      period: shape.periodFor(now, offsetFromNow),
      total_amount: value,
      total_volume: value,
      days_count: shape.daysCountFor(offsetFromNow, shape.count),
    };
  });

/**
 * 無料ユーザーへ見せるサンプル推移を組み立てる。
 * 推移詳細 API は Pro 限定なので叩かず、その場で一般的な例を生成する。
 * 表示単位（t / 本 など）だけは対象メニューに合わせ、加入後の見え方を正しく伝える。
 *
 * @param menu 対象メニューの表示情報（名称・単位）
 * @param now 期間ラベルの基準日
 */
export const buildSampleMenuTrend = (
  menu: MenuTrend["menu"],
  now: Date = new Date(),
): MenuTrend => ({
  menu,
  by_year: buildBuckets(SAMPLE_SHAPES.year, now),
  by_month: buildBuckets(SAMPLE_SHAPES.month, now),
  by_day: buildBuckets(SAMPLE_SHAPES.day, now),
});
