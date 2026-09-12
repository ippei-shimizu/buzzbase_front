import type { ImprovementTheme } from "@app/types/improvementTheme";
import {
  THEME_TABS,
  buildThemeStatusInput,
  countOpenThemes,
  groupThemesByStatus,
  isAtThemeFreeLimit,
  themeTransitions,
} from "../_utils/themeList";

function buildTheme(
  overrides: Partial<ImprovementTheme> = {},
): ImprovementTheme {
  return {
    id: 1,
    title: "肩の開きを抑える",
    category: "batting",
    purpose: null,
    status: "open",
    started_on: "2026-07-01",
    achieved_on: null,
    sort_order: 0,
    practice_logs_count: 0,
    notes_count: 0,
    active_days: 0,
    created_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("課題のタブ分類", () => {
  it("back の status enum と同じ3タブを持つ", () => {
    expect(THEME_TABS.map((tab) => tab.key)).toEqual([
      "open",
      "achieved",
      "archived",
    ]);
  });

  it("status ごとに振り分ける", () => {
    const open = buildTheme({ id: 1, status: "open" });
    const achieved = buildTheme({ id: 2, status: "achieved" });
    const archived = buildTheme({ id: 3, status: "archived" });
    const openTwo = buildTheme({ id: 4, status: "open" });

    const grouped = groupThemesByStatus([open, achieved, archived, openTwo]);

    expect(grouped.open.map((theme) => theme.id)).toEqual([1, 4]);
    expect(grouped.achieved.map((theme) => theme.id)).toEqual([2]);
    expect(grouped.archived.map((theme) => theme.id)).toEqual([3]);
  });

  it("課題が無ければ全タブが空になる", () => {
    expect(groupThemesByStatus([])).toEqual({
      open: [],
      achieved: [],
      archived: [],
    });
  });
});

describe("無料枠の判定", () => {
  it("取組中（open）だけを数える", () => {
    const themes = [
      buildTheme({ id: 1, status: "open" }),
      buildTheme({ id: 2, status: "achieved" }),
      buildTheme({ id: 3, status: "archived" }),
    ];

    expect(countOpenThemes(themes)).toBe(1);
  });

  it("取組中が2件で上限に達する", () => {
    const themes = [
      buildTheme({ id: 1, status: "open" }),
      buildTheme({ id: 2, status: "open" }),
    ];

    expect(
      isAtThemeFreeLimit({
        themes,
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(true);
  });

  it("取組中が1件なら上限に達しない", () => {
    const themes = [
      buildTheme({ id: 1, status: "open" }),
      buildTheme({ id: 2, status: "achieved" }),
      buildTheme({ id: 3, status: "archived" }),
    ];

    expect(
      isAtThemeFreeLimit({
        themes,
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });

  it("克服・アーカイブ済みが何件あっても枠を消費しない", () => {
    const themes = [
      buildTheme({ id: 1, status: "achieved" }),
      buildTheme({ id: 2, status: "achieved" }),
      buildTheme({ id: 3, status: "archived" }),
      buildTheme({ id: 4, status: "archived" }),
    ];

    expect(
      isAtThemeFreeLimit({
        themes,
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });

  it("Pro は取組中が上限を超えていても上限扱いにしない", () => {
    const themes = [
      buildTheme({ id: 1, status: "open" }),
      buildTheme({ id: 2, status: "open" }),
      buildTheme({ id: 3, status: "open" }),
    ];

    expect(
      isAtThemeFreeLimit({
        themes,
        hasUnlimited: true,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });

  it("Pro 判定が未確定の間は上限扱いにしない", () => {
    const themes = [
      buildTheme({ id: 1, status: "open" }),
      buildTheme({ id: 2, status: "open" }),
    ];

    expect(
      isAtThemeFreeLimit({
        themes,
        hasUnlimited: false,
        isEntitlementLoading: true,
      }),
    ).toBe(false);
  });
});

describe("状態遷移", () => {
  it("取組中では克服とアーカイブだけを出す", () => {
    expect(themeTransitions("open")).toEqual({
      canAchieve: true,
      canReopen: false,
      canArchive: true,
    });
  });

  it("克服済みでは再開とアーカイブを出す", () => {
    expect(themeTransitions("achieved")).toEqual({
      canAchieve: false,
      canReopen: true,
      canArchive: true,
    });
  });

  it("アーカイブ済みでは再開だけを出す", () => {
    expect(themeTransitions("archived")).toEqual({
      canAchieve: false,
      canReopen: true,
      canArchive: false,
    });
  });

  it("克服では達成日を記録する", () => {
    expect(buildThemeStatusInput("achieved", "2026-08-03")).toEqual({
      status: "achieved",
      achieved_on: "2026-08-03",
    });
  });

  it("取組中へ戻すときは達成日を消す", () => {
    expect(buildThemeStatusInput("open", "2026-08-03")).toEqual({
      status: "open",
      achieved_on: null,
    });
  });

  it("アーカイブでは達成日を触らない", () => {
    expect(buildThemeStatusInput("archived", "2026-08-03")).toEqual({
      status: "archived",
    });
  });
});
