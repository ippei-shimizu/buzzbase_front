import type { MenuTrend, MenuTrendBucket } from "@app/types/practice";
import { buildSampleMenuTrend } from "../../_components/menuTrendSampleData";
import {
  TREND_RANGE_OPTIONS,
  bucketValue,
  bucketValueText,
  bucketsForPeriod,
  isDayLimitReached,
  periodLabel,
  sliceByRange,
} from "../menuTrendRange";

const bucket = (overrides: Partial<MenuTrendBucket> = {}): MenuTrendBucket => ({
  period: "2026-08",
  total_amount: 620,
  total_volume: 8200,
  days_count: 4,
  ...overrides,
});

const trend = (isWeightReps: boolean): MenuTrend => ({
  menu: {
    id: 1,
    name: "メニュー",
    unit: isWeightReps ? "weight_reps" : "count",
    unit_label: isWeightReps ? "回" : "本",
    is_weight_reps: isWeightReps,
  },
  by_year: [bucket({ period: "2026" })],
  by_month: [bucket()],
  by_day: [bucket({ period: "2026-08-03" })],
});

describe("バケットの取り出し", () => {
  it("粒度に対応する配列を返す", () => {
    const data = trend(false);

    expect(bucketsForPeriod(data, "year")[0].period).toBe("2026");
    expect(bucketsForPeriod(data, "month")[0].period).toBe("2026-08");
    expect(bucketsForPeriod(data, "day")[0].period).toBe("2026-08-03");
  });

  it("レンジは新しい順の先頭から取る。全期間は絞らない", () => {
    const buckets = [bucket(), bucket(), bucket()];

    expect(sliceByRange(buckets, 2)).toHaveLength(2);
    expect(sliceByRange(buckets, null)).toHaveLength(3);
  });
});

describe("値の読み替え", () => {
  it("weight_reps は総挙上重量、それ以外は量を使う", () => {
    expect(bucketValue(trend(true), bucket())).toBe(8200);
    expect(bucketValue(trend(false), bucket())).toBe(620);
    expect(bucketValueText(trend(true), bucket())).toBe("8.2t");
    expect(bucketValueText(trend(false), bucket())).toBe("620本");
  });
});

describe("期間ラベル", () => {
  it("粒度ごとに読みやすい形にする", () => {
    expect(periodLabel("year", "2026")).toBe("2026年");
    expect(periodLabel("month", "2026-08")).toBe("2026/8");
    expect(periodLabel("day", "2026-08-03")).toBe("8/3");
  });
});

describe("レンジの選択肢", () => {
  it("粒度ごとに mobile と同じ選択肢を持つ", () => {
    expect(TREND_RANGE_OPTIONS.year.map((option) => option.label)).toEqual([
      "3年",
      "5年",
      "全期間",
    ]);
    expect(TREND_RANGE_OPTIONS.month.map((option) => option.label)).toEqual([
      "6ヶ月",
      "1年",
      "2年",
      "全期間",
    ]);
    expect(TREND_RANGE_OPTIONS.day.map((option) => option.label)).toEqual([
      "2週間",
      "1ヶ月",
      "3ヶ月",
      "全期間",
    ]);
  });
});

describe("日別の上限判定", () => {
  const buckets = (count: number) =>
    Array.from({ length: count }, () => bucket());

  it("日別が60件に達したときだけ true", () => {
    expect(isDayLimitReached("day", buckets(60))).toBe(true);
    expect(isDayLimitReached("day", buckets(59))).toBe(false);
    expect(isDayLimitReached("month", buckets(60))).toBe(false);
  });
});

describe("サンプル推移", () => {
  const menu = trend(false).menu;

  it("年3件・月6件・日14件を新しい順に組み立てる", () => {
    const sample = buildSampleMenuTrend(menu, new Date(2026, 7, 3));

    expect(sample.by_year.map((item) => item.period)).toEqual([
      "2026",
      "2025",
      "2024",
    ]);
    expect(sample.by_month).toHaveLength(6);
    expect(sample.by_month[0].period).toBe("2026-08");
    expect(sample.by_day).toHaveLength(14);
    expect(sample.by_day[0].period).toBe("2026-08-03");
  });

  it("古いほど値が小さい右肩上がりの例にする", () => {
    const sample = buildSampleMenuTrend(menu, new Date(2026, 7, 3));

    expect(sample.by_year[0].total_amount).toBeGreaterThan(
      sample.by_year[2].total_amount,
    );
  });

  it("表示単位を決めるメニュー情報はそのまま引き継ぐ", () => {
    const weightRepsMenu = trend(true).menu;

    expect(buildSampleMenuTrend(weightRepsMenu).menu.is_weight_reps).toBe(true);
  });
});
