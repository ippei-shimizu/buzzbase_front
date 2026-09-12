import { DEFAULT_PLAN_TAB, PLAN_TABS, parsePlanTab } from "../_utils/planTab";

describe("parsePlanTab", () => {
  it("week / calendar はそのまま解決する", () => {
    expect(parsePlanTab("week")).toBe("week");
    expect(parsePlanTab("calendar")).toBe("calendar");
  });

  // URL の打ち間違いで空白の画面を出さないため、既定の面へ倒す。
  it("未指定・不正値は既定の面へ倒す", () => {
    expect(parsePlanTab(undefined)).toBe(DEFAULT_PLAN_TAB);
    expect(parsePlanTab("")).toBe(DEFAULT_PLAN_TAB);
    expect(parsePlanTab("unknown")).toBe(DEFAULT_PLAN_TAB);
  });
});

describe("PLAN_TABS", () => {
  it("mobile と同じ並びで3面を持つ", () => {
    expect(PLAN_TABS.map((tab) => tab.key)).toEqual([
      "sets",
      "week",
      "calendar",
    ]);
  });

  it("各面の href から同じ面へ戻れる", () => {
    PLAN_TABS.forEach((tab) => {
      const query = tab.href.split("?")[1];
      const value = new URLSearchParams(query).get("tab") ?? undefined;
      expect(parsePlanTab(value)).toBe(tab.key);
    });
  });
});
