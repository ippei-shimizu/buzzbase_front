import { getCalculatorDefinition } from "../calculator-definitions";
import { pitchingStats } from "../pitching-stats";

const definition = getCalculatorDefinition("opponent-batting-average")!;

describe("被打率計算ツールの定義", () => {
  it("被安打 ÷ 打数 を .xxx 形式で返す", () => {
    const result = definition.calculate({ hitsAllowed: 30, atBats: 120 });

    expect(result).toBeCloseTo(0.25, 5);
    expect(definition.outputs[0].format(result as number)).toBe(".250");
  });

  it("打数が 0 なら計算しない", () => {
    expect(definition.calculate({ hitsAllowed: 5, atBats: 0 })).toBeNull();
  });

  it("被安打が打数を上回る入力は不正として扱う", () => {
    expect(definition.calculate({ hitsAllowed: 10, atBats: 8 })).toBeNull();
  });

  // formatRate は value === 0 のとき先頭 0 を落とさないため、他の表示（.250 等）と
  // 桁の形式が揃わない。修正時に気付けるよう現挙動を固定しておく。
  it("被安打 0 でも計算できる", () => {
    const result = definition.calculate({ hitsAllowed: 0, atBats: 12 });

    expect(result).toBe(0);
    expect(definition.outputs[0].format(result as number)).toBe("0.000");
  });

  it("関連ツールが既存の投手指標ツールを指している", () => {
    for (const slug of definition.relatedSlugs) {
      expect(getCalculatorDefinition(slug)).toBeDefined();
    }
  });

  it("成績算出ページの slug がすべて計算ツールの定義に解決できる", () => {
    for (const stat of pitchingStats) {
      if (!stat.slug) continue;
      expect(getCalculatorDefinition(stat.slug)).toBeDefined();
    }
  });
});
