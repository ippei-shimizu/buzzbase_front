import {
  ACTIVE_DAY_MILESTONES,
  ACTIVITY_LEVEL_COLORS,
  ACTIVITY_LEVEL_LABELS,
  FREE_GRASS_WINDOW_DAYS,
  SWING_MILESTONES,
} from "../activity";

/**
 * 草グラフの見た目と節目は mobile（components/grass、StreakHeaderSection）と
 * 同じでなければ「同じアプリの同じ機能」に見えない。値をここで固定して、
 * 片方だけこっそり変わることを防ぐ。
 */
describe("mobile との一致", () => {
  it("5 段階の色が mobile の INTENSITY_COLORS と同じ", () => {
    expect(ACTIVITY_LEVEL_COLORS).toEqual([
      "#4A4A4A",
      "#14532D",
      "#166534",
      "#16A34A",
      "#22C55E",
    ]);
  });

  it("段階のラベルが薄い順に並ぶ", () => {
    expect(ACTIVITY_LEVEL_LABELS).toEqual([
      "なし",
      "少なめ",
      "ふつう",
      "多め",
      "たっぷり",
    ]);
    expect(ACTIVITY_LEVEL_LABELS).toHaveLength(ACTIVITY_LEVEL_COLORS.length);
  });

  it("通算日数の節目が mobile の ACTIVE_DAY_MILESTONES と同じ", () => {
    expect(ACTIVE_DAY_MILESTONES).toEqual([
      10, 30, 50, 100, 150, 200, 300, 365, 500, 1000,
    ]);
  });

  it("素振り累計の節目が mobile の SWING_MILESTONES と同じ", () => {
    expect(SWING_MILESTONES).toEqual([1000, 5000, 10000, 30000, 50000, 100000]);
  });
});

describe("無料プランの期間", () => {
  it("back の FREE_WINDOW_DAYS と同じ 30 日", () => {
    expect(FREE_GRASS_WINDOW_DAYS).toBe(30);
  });
});
