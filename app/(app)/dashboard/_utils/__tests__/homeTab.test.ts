import { DEFAULT_HOME_TAB, parseHomeTab } from "../homeTab";

describe("parseHomeTab", () => {
  it("既定は「練習・活動」面", () => {
    expect(DEFAULT_HOME_TAB).toBe("activity");
    expect(parseHomeTab(undefined)).toBe("activity");
  });

  it("tab=dashboard でダッシュボード面になる", () => {
    expect(parseHomeTab("dashboard")).toBe("dashboard");
  });

  it("tab=activity は「練習・活動」面", () => {
    expect(parseHomeTab("activity")).toBe("activity");
  });

  it("不正値は既定の面へ倒す", () => {
    expect(parseHomeTab("stats")).toBe("activity");
    expect(parseHomeTab("")).toBe("activity");
  });
});
