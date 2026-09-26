import { battingStats } from "../batting-stats";
import { getCalculatorDefinition } from "../calculator-definitions";
import { pitchingStats } from "../pitching-stats";

const definition = getCalculatorDefinition("risp-batting-average")!;

describe("得点圏打率計算ツールの定義", () => {
  it("得点圏での安打 ÷ 打数 を .xxx 形式で返す", () => {
    const result = definition.calculate({ hits: 12, atBats: 40 });

    expect(result).toBeCloseTo(0.3, 5);
    expect(definition.outputs[0].format(result as number)).toBe(".300");
  });

  it("打数が 0 なら計算しない", () => {
    expect(definition.calculate({ hits: 3, atBats: 0 })).toBeNull();
  });

  it("安打が打数を上回る入力は不正として扱う", () => {
    expect(definition.calculate({ hits: 10, atBats: 8 })).toBeNull();
  });

  it("安打 0 でも計算できる", () => {
    const result = definition.calculate({ hits: 0, atBats: 15 });

    expect(result).toBe(0);
    expect(definition.outputs[0].format(result as number)).toBe(".000");
  });

  it("関連ツールが既存の打撃指標ツールを指している", () => {
    for (const slug of definition.relatedSlugs) {
      expect(getCalculatorDefinition(slug)).toBeDefined();
    }
  });

  it("打率ツールから得点圏打率ツールへ相互リンクしている", () => {
    expect(getCalculatorDefinition("batting-average")!.relatedSlugs).toContain(
      "risp-batting-average",
    );
  });

  it("成績算出ページの slug がすべて計算ツールの定義に解決できる", () => {
    for (const stat of [...battingStats, ...pitchingStats]) {
      if (!stat.slug) continue;
      expect(getCalculatorDefinition(stat.slug)).toBeDefined();
    }
  });
});
