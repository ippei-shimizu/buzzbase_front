import {
  INSIGHT_COMBINATION_LIMIT,
  INSIGHT_INPUT_OPTIONS,
  INSIGHT_METRIC_OPTIONS,
  PRACTICE_MENU_INPUT_TYPE,
} from "@app/constants/insight";

/**
 * 選択肢のキーは back の Insights::Catalog が唯一の正で、ずれると作成が
 * inclusion バリデーションで弾かれる（UI 上は「作れないボタン」になる）。
 * 期待値は back/app/services/insights/catalog.rb を写したもの。
 */
const CATALOG_INPUT_KEYS = [
  "total_swings",
  "practice_days",
  "sleep_hours",
  "physical_level",
  "energy_level",
];

const CATALOG_METRIC_KEYS = [
  "batting_average",
  "on_base_percentage",
  "slugging_percentage",
  "ops",
  "era",
  "whip",
  "bb_per9",
];

describe("インサイトの選択肢", () => {
  it("入力キーが Insights::Catalog::INPUTS と一致する", () => {
    expect(INSIGHT_INPUT_OPTIONS.map((option) => option.key)).toEqual(
      CATALOG_INPUT_KEYS,
    );
  });

  it("成績キーが Insights::Catalog::METRICS と一致する", () => {
    expect(INSIGHT_METRIC_OPTIONS.map((option) => option.key)).toEqual(
      CATALOG_METRIC_KEYS,
    );
  });

  it("練習メニューの input_type が Insights::Catalog::INPUT_TYPES の特別キーと一致する", () => {
    expect(PRACTICE_MENU_INPUT_TYPE).toBe("practice_menu");
    expect(CATALOG_INPUT_KEYS).not.toContain(PRACTICE_MENU_INPUT_TYPE);
  });

  it("すべての選択肢にラベルがある", () => {
    for (const option of [
      ...INSIGHT_INPUT_OPTIONS,
      ...INSIGHT_METRIC_OPTIONS,
    ]) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it("投手指標は投手側として区別する（防御率は下がるほど良いため向きの解釈が異なる）", () => {
    const pitching = INSIGHT_METRIC_OPTIONS.filter(
      (option) => option.side === "pitching",
    ).map((option) => option.key);
    expect(pitching).toEqual(["era", "whip", "bb_per9"]);
  });

  it("自作の上限が PlanLimits::INSIGHT_COMBINATION_LIMIT と一致する", () => {
    expect(INSIGHT_COMBINATION_LIMIT).toBe(20);
  });
});
