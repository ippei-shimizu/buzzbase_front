import type { Schedule } from "@app/types/schedule";
import {
  mergeSchedules,
  nextWeekStart,
  singleSchedulesByDate,
  weekDates,
  weekEnd,
  weekRangeLabel,
} from "../weeklyPlan";

function buildSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 1,
    title: "朝練",
    days_of_week: null,
    planned_on: "2026-08-03",
    scheduled_time: "06:00",
    event_type: "self_practice",
    recurring: false,
    menu_set_id: null,
    game_result_id: null,
    note: null,
    notification_enabled: false,
    active: true,
    notification_message: null,
    menus: [],
    logged_practice_menu_ids: [],
    ...overrides,
  };
}

// 2026-08-03 は月曜、2026-08-09 は日曜。
const MONDAY = "2026-08-03";

describe("weekDates", () => {
  it("月曜から日曜までの 7 日を返す", () => {
    expect(weekDates(MONDAY)).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
  });

  it("週の途中の日を渡しても、その週の月曜から始まる", () => {
    expect(weekDates("2026-08-06")[0]).toBe(MONDAY);
  });

  it("日曜を渡したときは前の月曜から始まる（週始まりは日曜ではない）", () => {
    expect(weekDates("2026-08-09")[0]).toBe(MONDAY);
    expect(weekDates("2026-08-09")[6]).toBe("2026-08-09");
  });
});

describe("weekEnd / nextWeekStart", () => {
  it("週末は日曜", () => {
    expect(weekEnd(MONDAY)).toBe("2026-08-09");
  });

  it("翌週の起点は 7 日後", () => {
    expect(nextWeekStart(MONDAY)).toBe("2026-08-10");
  });

  it("月をまたぐ週でも 7 日後になる", () => {
    expect(nextWeekStart("2026-08-31")).toBe("2026-09-07");
  });
});

describe("weekRangeLabel", () => {
  it("月/日〜月/日 で表示する", () => {
    expect(weekRangeLabel(MONDAY)).toBe("8/3〜8/9");
  });

  it("月をまたぐ週は両方の月を出す", () => {
    expect(weekRangeLabel("2026-08-31")).toBe("8/31〜9/6");
  });
});

describe("singleSchedulesByDate", () => {
  it("その週の単発予定だけを日付ごとにまとめる", () => {
    const inWeek = buildSchedule({ id: 1, planned_on: "2026-08-05" });
    const beforeWeek = buildSchedule({ id: 2, planned_on: "2026-08-02" });
    const afterWeek = buildSchedule({ id: 3, planned_on: "2026-08-10" });

    const grouped = singleSchedulesByDate(
      [inWeek, beforeWeek, afterWeek],
      MONDAY,
    );

    expect(grouped.get("2026-08-05")).toEqual([inWeek]);
    expect(grouped.get("2026-08-02")).toBeUndefined();
    expect(grouped.get("2026-08-10")).toBeUndefined();
  });

  it("週の両端（月曜・日曜）を含む", () => {
    const monday = buildSchedule({ id: 1, planned_on: MONDAY });
    const sunday = buildSchedule({ id: 2, planned_on: "2026-08-09" });

    const grouped = singleSchedulesByDate([monday, sunday], MONDAY);

    expect(grouped.get(MONDAY)).toEqual([monday]);
    expect(grouped.get("2026-08-09")).toEqual([sunday]);
  });

  it("毎週くり返す予定は含めない（コピー対象と揃える）", () => {
    const recurring = buildSchedule({
      id: 9,
      planned_on: null,
      days_of_week: "1,3,5",
      recurring: true,
    });

    const grouped = singleSchedulesByDate([recurring], MONDAY);

    expect(grouped.size).toBe(0);
  });

  it("同じ日の予定は時刻順（未設定は末尾）に並ぶ", () => {
    const afternoon = buildSchedule({ id: 1, scheduled_time: "15:00" });
    const allDay = buildSchedule({ id: 2, scheduled_time: null });
    const morning = buildSchedule({ id: 3, scheduled_time: "06:00" });

    const grouped = singleSchedulesByDate([afternoon, allDay, morning], MONDAY);

    expect(grouped.get(MONDAY)?.map((item) => item.id)).toEqual([3, 1, 2]);
  });
});

describe("mergeSchedules", () => {
  it("既存に無い予定だけを足す", () => {
    const existing = buildSchedule({ id: 1 });
    const added = buildSchedule({ id: 2, planned_on: "2026-08-10" });

    expect(mergeSchedules([existing], [added])).toEqual([existing, added]);
  });

  it("同じ id は重複させない", () => {
    const existing = buildSchedule({ id: 1 });

    expect(mergeSchedules([existing], [buildSchedule({ id: 1 })])).toEqual([
      existing,
    ]);
  });
});
