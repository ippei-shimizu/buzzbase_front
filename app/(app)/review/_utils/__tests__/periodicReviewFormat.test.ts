import type { PeriodicReview } from "@app/types/periodicReview";
import {
  formatCount,
  formatDelta,
  formatFixed,
  formatRatio,
  periodicReviewTitle,
  unreadReviewIds,
} from "../periodicReviewFormat";

const buildReview = (id: number, read: boolean): PeriodicReview => ({
  id,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read,
  summary: {},
});

describe("formatRatio", () => {
  it("先頭の 0 を落とした .XXX 表記にする", () => {
    expect(formatRatio(0.312)).toBe(".312");
    expect(formatRatio("0.312")).toBe(".312");
    expect(formatRatio(1)).toBe("1.000");
  });

  it("欠損は - を返す（0 と区別する）", () => {
    expect(formatRatio(undefined)).toBe("-");
    expect(formatRatio(null)).toBe("-");
    expect(formatRatio("")).toBe("-");
    expect(formatRatio(0)).toBe(".000");
  });
});

describe("formatDelta", () => {
  it("上昇は + 、下降は - を付ける", () => {
    expect(formatDelta(0.026)).toBe("+.026");
    expect(formatDelta(-0.012)).toBe("-.012");
    expect(formatDelta(0)).toBe("+.000");
  });

  it("欠損は null を返して行ごと出さない", () => {
    expect(formatDelta(undefined)).toBeNull();
    expect(formatDelta("abc")).toBeNull();
  });
});

describe("formatFixed", () => {
  it("桁数を指定して整形する", () => {
    expect(formatFixed(2.5, 2)).toBe("2.50");
    expect(formatFixed("9.0", 1)).toBe("9.0");
  });

  it("欠損は - を返す", () => {
    expect(formatFixed(null, 2)).toBe("-");
  });
});

describe("formatCount", () => {
  it("桁区切りと単位を付ける", () => {
    expect(formatCount(1200)).toBe("1,200");
    expect(formatCount("5", "日")).toBe("5日");
    expect(formatCount(0, "日")).toBe("0日");
  });

  it("欠損は単位を付けず - を返す", () => {
    expect(formatCount(undefined, "日")).toBe("-");
  });
});

describe("periodicReviewTitle", () => {
  it("週次は開始日が属する月の何週目かを見出しにする", () => {
    expect(
      periodicReviewTitle({
        period_type: "weekly",
        period_start: "2026-07-06",
      }),
    ).toBe("7月 第1週の振り返り");
    expect(
      periodicReviewTitle({
        period_type: "weekly",
        period_start: "2026-07-13",
      }),
    ).toBe("7月 第2週の振り返り");
    expect(
      periodicReviewTitle({
        period_type: "weekly",
        period_start: "2026-07-29",
      }),
    ).toBe("7月 第5週の振り返り");
  });

  it("月をまたぐ週は開始日（月曜）の月に帰属させる", () => {
    expect(
      periodicReviewTitle({
        period_type: "weekly",
        period_start: "2026-06-29",
      }),
    ).toBe("6月 第5週の振り返り");
  });

  it("月次は年月を見出しにする", () => {
    expect(
      periodicReviewTitle({
        period_type: "monthly",
        period_start: "2026-07-01",
      }),
    ).toBe("2026年7月の振り返り");
  });
});

describe("unreadReviewIds", () => {
  it("未読のレポートの id だけを返す", () => {
    expect(
      unreadReviewIds([
        buildReview(1, false),
        buildReview(2, true),
        buildReview(3, false),
      ]),
    ).toEqual([1, 3]);
  });

  it("すべて既読なら空配列を返す", () => {
    expect(unreadReviewIds([buildReview(1, true)])).toEqual([]);
  });
});
