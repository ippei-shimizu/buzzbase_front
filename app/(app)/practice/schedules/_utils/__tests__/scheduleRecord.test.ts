import type { PracticeLog } from "@app/types/practice";
import type { ScheduleMenu, Schedule } from "@app/types/schedule";
import {
  buildDoneLogIds,
  buildPracticeRecordHref,
  doneMenusAsPresets,
  resolveContextDate,
} from "../scheduleRecord";

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 1,
    practice_menu_id: 1,
    schedule_id: 10,
    logged_on: "2026-08-03",
    amount: null,
    weight: null,
    menu_name: "素振り",
    unit_label: "本",
    source: "manual",
    memo: null,
    created_at: "2026-08-03T00:00:00Z",
    ...overrides,
  };
}

function buildSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 10,
    title: "朝の素振り",
    days_of_week: "1,3,5",
    planned_on: null,
    scheduled_time: "06:00",
    end_time: null,
    event_type: "self_practice",
    recurring: true,
    menu_set_id: null,
    game_result_id: null,
    note: null,
    notification_enabled: true,
    active: true,
    notification_message: null,
    menus: [],
    logged_practice_menu_ids: [],
    ...overrides,
  };
}

describe("resolveContextDate", () => {
  it("クエリの日付を優先する", () => {
    expect(
      resolveContextDate("2026-08-05", buildSchedule(), "2026-08-03"),
    ).toBe("2026-08-05");
  });

  it("クエリが無ければ単発予定の日付を使う", () => {
    expect(
      resolveContextDate(
        undefined,
        buildSchedule({ days_of_week: null, planned_on: "2026-08-09" }),
        "2026-08-03",
      ),
    ).toBe("2026-08-09");
  });

  it("毎週の予定を直接開いたときは今日を使う", () => {
    expect(resolveContextDate(undefined, buildSchedule(), "2026-08-03")).toBe(
      "2026-08-03",
    );
  });

  it("形式が不正なクエリは無視する", () => {
    expect(resolveContextDate("yesterday", buildSchedule(), "2026-08-03")).toBe(
      "2026-08-03",
    );
  });
});

describe("buildDoneLogIds", () => {
  it("その予定のログだけを practice_menu_id 別に集める", () => {
    const logs = [
      buildLog({ id: 1, practice_menu_id: 1 }),
      buildLog({ id: 2, practice_menu_id: 2 }),
      buildLog({ id: 3, practice_menu_id: 1, schedule_id: 99 }),
      buildLog({ id: 4, practice_menu_id: 1, schedule_id: null }),
    ];

    expect(buildDoneLogIds(logs, 10)).toEqual({ 1: [1], 2: [2] });
  });

  it("同じメニューに複数ログがあれば全ての ID を持つ", () => {
    const logs = [
      buildLog({ id: 1, practice_menu_id: 1 }),
      buildLog({ id: 5, practice_menu_id: 1 }),
    ];

    expect(buildDoneLogIds(logs, 10)).toEqual({ 1: [1, 5] });
  });
});

describe("doneMenusAsPresets", () => {
  it("済のメニューだけを目標量つきで返す", () => {
    const menus: ScheduleMenu[] = [
      {
        practice_menu_id: 1,
        name: "素振り",
        unit: "count",
        unit_label: "本",
        target_value: 200,
      },
      {
        practice_menu_id: 2,
        name: "ランニング",
        unit: "count",
        unit_label: "km",
        target_value: 5,
      },
    ];

    expect(doneMenusAsPresets(menus, { 1: [1] })).toEqual([
      { practice_menu_id: 1, target_value: 200 },
    ]);
  });
});

describe("buildPracticeRecordHref", () => {
  it("date と presetMenus の両方を渡す", () => {
    const href = buildPracticeRecordHref("2026-08-03", [
      { practice_menu_id: 1, target_value: 200 },
    ]);
    const params = new URLSearchParams(href.split("?")[1]);

    expect(href.startsWith("/practice/record?")).toBe(true);
    expect(params.get("date")).toBe("2026-08-03");
    expect(JSON.parse(params.get("presetMenus") as string)).toEqual([
      { practice_menu_id: 1, target_value: 200 },
    ]);
  });

  it("済メニューが無くても date は必ず渡す", () => {
    const href = buildPracticeRecordHref("2026-08-03", []);
    const params = new URLSearchParams(href.split("?")[1]);

    expect(params.get("date")).toBe("2026-08-03");
    expect(params.get("presetMenus")).toBeNull();
  });
});
