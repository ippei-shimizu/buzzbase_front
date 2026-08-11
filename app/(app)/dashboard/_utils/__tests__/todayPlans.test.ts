import type { Plan, PlanMenu } from "@app/types/plan";
import type { PracticeLog } from "@app/types/practice";
import {
  doneLogIdsOf,
  donePresetMenus,
  planMenuKey,
  setMenuDone,
} from "../todayPlans";

function buildMenu(overrides: Partial<PlanMenu> = {}): PlanMenu {
  return {
    practice_menu_id: 1,
    name: "素振り",
    unit: "count",
    unit_label: "本",
    target_value: 200,
    sort_order: 0,
    done: false,
    ...overrides,
  };
}

function buildPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 10,
    title: "朝練",
    event_type: "self_practice",
    scheduled_time: "06:00",
    end_time: null,
    recurring: true,
    menu_set_id: null,
    game_result_id: null,
    note: null,
    menus: [buildMenu()],
    done: false,
    ...overrides,
  };
}

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 100,
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

describe("planMenuKey", () => {
  it("同じメニューでも予定が違えば別のキーになる", () => {
    expect(planMenuKey(10, 1)).not.toBe(planMenuKey(11, 1));
  });
});

describe("setMenuDone", () => {
  it("対象メニューの done を指定値にする", () => {
    const plans = [buildPlan()];

    const next = setMenuDone(plans, 10, 1, true);

    expect(next[0].menus[0].done).toBe(true);
  });

  it("同じ値をもう一度指定しても反転しない（ロールバックが元に戻せる）", () => {
    const plans = setMenuDone([buildPlan()], 10, 1, true);

    expect(setMenuDone(plans, 10, 1, true)[0].menus[0].done).toBe(true);
  });

  it("同じメニューを持つ別の予定には波及しない", () => {
    const plans = [buildPlan({ id: 10 }), buildPlan({ id: 11 })];

    const next = setMenuDone(plans, 10, 1, true);

    expect(next[0].menus[0].done).toBe(true);
    expect(next[1].menus[0].done).toBe(false);
  });

  it("全メニューが済になったら予定全体も済にする", () => {
    const plans = [
      buildPlan({
        menus: [
          buildMenu({ practice_menu_id: 1, done: true }),
          buildMenu({ practice_menu_id: 2, done: false }),
        ],
      }),
    ];

    expect(setMenuDone(plans, 10, 2, true)[0].done).toBe(true);
  });

  it("1 つでも未済に戻れば予定全体の済も外れる", () => {
    const plans = [
      buildPlan({
        done: true,
        menus: [
          buildMenu({ practice_menu_id: 1, done: true }),
          buildMenu({ practice_menu_id: 2, done: true }),
        ],
      }),
    ];

    expect(setMenuDone(plans, 10, 2, false)[0].done).toBe(false);
  });

  it("元の配列を書き換えない", () => {
    const plans = [buildPlan()];

    setMenuDone(plans, 10, 1, true);

    expect(plans[0].menus[0].done).toBe(false);
  });
});

describe("donePresetMenus", () => {
  it("済のメニューだけを目標量つきで返す", () => {
    const plans = [
      buildPlan({
        menus: [
          buildMenu({ practice_menu_id: 1, target_value: 200, done: true }),
          buildMenu({ practice_menu_id: 2, target_value: 5, done: false }),
        ],
      }),
    ];

    expect(donePresetMenus(plans)).toEqual([
      { practice_menu_id: 1, target_value: 200 },
    ]);
  });

  it("複数の予定に同じメニューがあっても 1 件にまとめる", () => {
    const plans = [
      buildPlan({
        id: 10,
        menus: [buildMenu({ practice_menu_id: 1, done: true })],
      }),
      buildPlan({
        id: 11,
        menus: [
          buildMenu({ practice_menu_id: 1, target_value: 50, done: true }),
        ],
      }),
    ];

    expect(donePresetMenus(plans)).toEqual([
      { practice_menu_id: 1, target_value: 200 },
    ]);
  });

  it("済が無ければ空配列", () => {
    expect(donePresetMenus([buildPlan()])).toEqual([]);
  });
});

describe("doneLogIdsOf", () => {
  it("その予定・そのメニューのログ ID だけを返す", () => {
    const logs = [
      buildLog({ id: 100 }),
      buildLog({ id: 101, schedule_id: 11 }),
      buildLog({ id: 102, practice_menu_id: 2 }),
    ];

    expect(doneLogIdsOf(logs, 10, 1)).toEqual([100]);
  });

  it("予定に紐づかないログ（schedule_id が null）は対象にしない", () => {
    const logs = [buildLog({ id: 200, schedule_id: null })];

    expect(doneLogIdsOf(logs, 10, 1)).toEqual([]);
  });

  it("同じメニューのログが複数あればすべて返す", () => {
    const logs = [buildLog({ id: 100 }), buildLog({ id: 103 })];

    expect(doneLogIdsOf(logs, 10, 1)).toEqual([100, 103]);
  });
});
