import { INSIGHT_COMBINATION_LIMIT } from "@app/constants/insight";
import * as copy from "../_components/insightCopy";
import { SAMPLE_INSIGHTS } from "../_components/insightSampleData";
import { insufficientInsightBody } from "../_utils/insightDisplay";

/**
 * この機能が示すのは相関であって因果ではない。
 * 「やれば上がる」と読める断定表現は、景表法上もユーザー理解のうえでも許容できないため、
 * 画面に出る文言をここで固定する。
 */
const ASSERTIVE_EXPRESSIONS = [
  "成績が上が",
  "成績が伸び",
  "打率が上が",
  "必ず成績",
  "効果があります",
  "改善されます",
  "保証",
  "確実に",
];

const COPY_VALUES: string[] = Object.values(copy);

const ALL_COPY = [
  ...COPY_VALUES,
  ...SAMPLE_INSIGHTS.map((insight) => insight.body),
  ...SAMPLE_INSIGHTS.map((insight) => insight.title),
  insufficientInsightBody("素振りの本数と打率"),
];

describe("インサイト画面の文言", () => {
  it("断定的な因果表現を含まない", () => {
    for (const text of ALL_COPY) {
      for (const expression of ASSERTIVE_EXPRESSIONS) {
        expect(text).not.toContain(expression);
      }
    }
  });

  it("リード文で必ずそうなるとは限らないことを明示する", () => {
    expect(copy.PAGE_DESCRIPTION).toContain("必ずそうなるとは限りません");
  });

  it("データ不足の本文は数値ではなく、まだ分からないことを伝える", () => {
    expect(insufficientInsightBody("素振りの本数と打率")).toBe(
      "素振りの本数と打率の関係は、もう少しデータが集まると分かります。",
    );
  });

  it("サンプルの本文は mobile と同じ非断定トーンにそろえる", () => {
    expect(SAMPLE_INSIGHTS.map((insight) => insight.body)).toEqual([
      "素振りが多い週は、打率が高い傾向があります。",
      "睡眠時間が短い週は、疲労度の自己評価が高くなる傾向があります。",
      "練習日数が多い週は、三振の割合が低くなる傾向があります。",
    ]);
  });

  it("サンプルは削除できない（組み合わせ id を持たない）", () => {
    for (const insight of SAMPLE_INSIGHTS) {
      expect(insight.id).toBeNull();
    }
  });

  it("上限の案内は件数上限として伝え、Pro 加入を促さない", () => {
    expect(copy.LIMIT_REACHED_MESSAGE).toContain(
      String(INSIGHT_COMBINATION_LIMIT),
    );
    expect(copy.LIMIT_REACHED_MESSAGE).not.toContain("Pro");
  });

  it("Pro 限定の案内は件数上限に言及しない（403 と 422 を混同させない）", () => {
    expect(copy.PRO_ONLY_ERROR).toContain("Pro プラン限定");
    expect(copy.PRO_ONLY_ERROR).not.toContain(
      String(INSIGHT_COMBINATION_LIMIT),
    );
  });

  it("0 件と取得失敗を別の文言で伝える", () => {
    expect(copy.EMPTY_MESSAGE).not.toBe(copy.LOAD_ERROR_MESSAGE);
    expect(copy.LOAD_ERROR_MESSAGE).toContain("取得できませんでした");
    expect(copy.EMPTY_MESSAGE).not.toContain("取得できませんでした");
  });
});
