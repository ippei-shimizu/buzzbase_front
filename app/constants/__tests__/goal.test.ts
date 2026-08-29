import {
  GOAL_METRICS,
  GOAL_METRIC_CATEGORIES,
  metricLabel,
  metricsInCategory,
} from "@app/constants/goal";

describe("練習・試合カテゴリの指標", () => {
  const practiceCategory = GOAL_METRIC_CATEGORIES.find(
    (category) => category.key === "practice",
  );

  it("素振り本数は選択肢から外す", () => {
    expect(practiceCategory?.keys).not.toContain("total_swing_count");
  });

  it("自主練習日数とメニュー回数を選べる", () => {
    expect(practiceCategory?.keys).toEqual(
      expect.arrayContaining(["self_practice_days", "menu_practice_amount"]),
    );
  });

  it("選択肢はすべて指標定義を持つ", () => {
    GOAL_METRIC_CATEGORIES.forEach((category) => {
      expect(metricsInCategory(category.keys)).toHaveLength(
        category.keys.length,
      );
    });
  });
});

// 選択肢から外しても確定済みの目標は履歴に残るため、ラベルが引けなくなってはいけない。
describe("廃止した指標の表示", () => {
  it("素振り本数のラベルを引ける", () => {
    expect(metricLabel("total_swing_count")).toBe("素振り本数");
  });

  it("指標定義には残っている", () => {
    expect(
      GOAL_METRICS.some((metric) => metric.key === "total_swing_count"),
    ).toBe(true);
  });
});
