import type { CorrelationInsight } from "@app/types/insight";
import {
  insightBody,
  insightDirection,
  insightMeta,
  isDuplicateInsightCombination,
  isPresetInsight,
  splitInsights,
} from "../_utils/insightDisplay";

const buildInsight = (
  overrides: Partial<CorrelationInsight> = {},
): CorrelationInsight => ({
  key: "swings_vs_ba",
  id: null,
  title: "素振りの本数と打率",
  body: "素振りの本数が多い週ほど、打率が.045高い傾向。いまの取り組みが効いていそう。この調子で続けよう。",
  metric: "batting_average",
  dimension: "total_swings",
  direction: "positive",
  strength: "strong",
  sample_weeks: 8,
  sufficient: true,
  ...overrides,
});

describe("insightDirection", () => {
  it("十分なデータがあるカードは back の向きをそのまま使う", () => {
    expect(insightDirection(buildInsight({ direction: "positive" }))).toBe(
      "positive",
    );
    expect(insightDirection(buildInsight({ direction: "negative" }))).toBe(
      "negative",
    );
  });

  it("データ不足のカードは向きを断定しない", () => {
    expect(
      insightDirection(
        buildInsight({ sufficient: false, direction: "positive" }),
      ),
    ).toBe("unknown");
    expect(
      insightDirection(
        buildInsight({ sufficient: false, direction: "negative" }),
      ),
    ).toBe("unknown");
  });
});

describe("insightBody", () => {
  it("十分なデータがあるカードは back の本文をそのまま出す", () => {
    const insight = buildInsight();
    expect(insightBody(insight)).toBe(insight.body);
  });

  it("データ不足のカードでは差の数値も傾向も出さない", () => {
    const body = insightBody(
      buildInsight({
        sufficient: false,
        body: "素振りの本数が多い週ほど、打率が.045高い傾向。",
      }),
    );

    expect(body).toBe(
      "素振りの本数と打率の関係は、もう少しデータが集まると分かります。",
    );
    expect(body).not.toContain(".045");
    expect(body).not.toContain("傾向");
  });
});

describe("insightMeta", () => {
  it("十分なデータがあっても断定せず、相関であることを添える", () => {
    expect(insightMeta(buildInsight({ sample_weeks: 12 }))).toBe(
      "直近12週の傾向（必ずそうとは限りません）",
    );
  });

  it("データ不足では週数を出さず、まだ分からないことだけを伝える", () => {
    const meta = insightMeta(
      buildInsight({ sufficient: false, sample_weeks: 3 }),
    );

    expect(meta).toBe("データが集まると分かります");
    expect(meta).not.toMatch(/\d/);
  });
});

describe("splitInsights", () => {
  it("id を持つものを自作、持たないものをおすすめに分ける", () => {
    const preset = buildInsight({ key: "swings_vs_ba", id: null });
    const custom = buildInsight({ key: "custom_7", id: 7 });

    const { customs, presets } = splitInsights([preset, custom]);

    expect(customs.map((insight) => insight.key)).toEqual(["custom_7"]);
    expect(presets.map((insight) => insight.key)).toEqual(["swings_vs_ba"]);
  });

  it("おすすめは組み合わせ id を持たない", () => {
    expect(isPresetInsight(buildInsight({ id: null }))).toBe(true);
    expect(isPresetInsight(buildInsight({ id: 1 }))).toBe(false);
  });
});

describe("isDuplicateInsightCombination", () => {
  const customs = [
    buildInsight({
      key: "custom_1",
      id: 1,
      dimension: "sleep_hours",
      metric: "ops",
    }),
  ];

  it("入力と成績がどちらも同じなら重複とみなす", () => {
    expect(
      isDuplicateInsightCombination(customs, {
        input_type: "sleep_hours",
        metric: "ops",
      }),
    ).toBe(true);
  });

  it("成績が違えば重複ではない", () => {
    expect(
      isDuplicateInsightCombination(customs, {
        input_type: "sleep_hours",
        metric: "era",
      }),
    ).toBe(false);
  });

  it("練習メニューはどのメニューか分からないため先回りで弾かない", () => {
    const menuCustoms = [
      buildInsight({
        key: "custom_2",
        id: 2,
        dimension: "practice_menu",
        metric: "ops",
      }),
    ];

    expect(
      isDuplicateInsightCombination(menuCustoms, {
        input_type: "practice_menu",
        practice_menu_id: 99,
        metric: "ops",
      }),
    ).toBe(false);
  });
});
