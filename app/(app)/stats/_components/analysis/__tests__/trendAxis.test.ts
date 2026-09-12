import { MAX_SEASON_X_LABELS, toSeasonAxisLabel } from "../trendAxis";

describe("toSeasonAxisLabel", () => {
  it("収まる長さのシーズン名はそのまま返す", () => {
    expect(toSeasonAxisLabel("2026春季")).toBe("2026春季");
  });

  it("長いシーズン名は省略記号付きで丸める", () => {
    expect(toSeasonAxisLabel("2026春季リーグ戦")).toBe("2026春季…");
  });

  it("丸めた末尾の空白は落とす", () => {
    expect(toSeasonAxisLabel("2026年 春季大会")).toBe("2026年…");
  });

  // シーズン名はユーザーの自由入力なので絵文字が混ざりうる。
  it("絵文字をサロゲートペアの途中で分断しない", () => {
    expect(toSeasonAxisLabel("⚾️🔥春季リーグ戦")).not.toContain("�");
    expect(Array.from(toSeasonAxisLabel("🔥🔥🔥🔥🔥🔥🔥🔥"))).toHaveLength(7);
  });
});

describe("MAX_SEASON_X_LABELS", () => {
  it("シーズン粒度の X 軸ラベル本数の上限を持つ", () => {
    expect(MAX_SEASON_X_LABELS).toBeGreaterThan(0);
  });
});
