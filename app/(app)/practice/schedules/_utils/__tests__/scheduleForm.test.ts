import type { ScheduleMenu } from "@app/types/schedule";
import {
  RECURRENCE_CONFLICT_ERROR,
  RECURRENCE_MISSING_ERROR,
  type ScheduleFormValues,
  TITLE_REQUIRED_ERROR,
  TITLE_TOO_LONG_ERROR,
  buildScheduleInput,
  buildScheduleMenuItems,
  validateScheduleInput,
} from "../scheduleForm";

function buildValues(
  overrides: Partial<ScheduleFormValues> = {},
): ScheduleFormValues {
  return {
    recurrence: "single",
    eventType: "self_practice",
    title: "朝の素振り",
    days: [],
    plannedOn: "2026-08-10",
    scheduledTime: "06:00",
  endTime: "",
    menuSource: "individual",
    menuSetId: null,
    menuAmounts: {},
    notificationEnabled: true,
    notificationMessage: "",
  note: "",
    ...overrides,
  };
}

const lockedMenu: ScheduleMenu = {
  practice_menu_id: 1,
  name: "素振り",
  unit_label: "本",
  target_value: 200,
};

describe("buildScheduleInput", () => {
  it("この日だけの予定は planned_on だけを送り、days_of_week は null にする", () => {
    const input = buildScheduleInput(buildValues(), {
      canCustomizeMessage: false,
      lockedMenus: [],
    });

    expect(input.planned_on).toBe("2026-08-10");
    expect(input.days_of_week).toBeNull();
  });

  it("毎週の予定は days_of_week だけを送り、planned_on は null にする", () => {
    const input = buildScheduleInput(
      buildValues({ recurrence: "weekly", days: [5, 1, 3] }),
      { canCustomizeMessage: false, lockedMenus: [] },
    );

    expect(input.days_of_week).toBe("1,3,5");
    expect(input.planned_on).toBeNull();
  });

  it("曜日は月=1〜日=7 の番号で送る", () => {
    const input = buildScheduleInput(
      buildValues({ recurrence: "weekly", days: [7, 6] }),
      { canCustomizeMessage: false, lockedMenus: [] },
    );

    expect(input.days_of_week).toBe("6,7");
  });

  it("メニューセットを選ぶと menu_set_id を送り、個別メニューは空にする", () => {
    const input = buildScheduleInput(
      buildValues({
        menuSource: "set",
        menuSetId: 3,
        menuAmounts: { 1: "100" },
      }),
      { canCustomizeMessage: false, lockedMenus: [] },
    );

    expect(input.menu_set_id).toBe(3);
    expect(input.menus).toEqual([]);
  });

  it("カスタム通知文は Pro を持たないと送らない", () => {
    const values = buildValues({ notificationMessage: "頑張れ" });

    expect(
      buildScheduleInput(values, {
        canCustomizeMessage: false,
        lockedMenus: [],
      }).notification_message,
    ).toBeNull();
    expect(
      buildScheduleInput(values, { canCustomizeMessage: true, lockedMenus: [] })
        .notification_message,
    ).toBe("頑張れ");
  });
});

describe("buildScheduleMenuItems（編集ロック）", () => {
  it("記録済みメニューは選択から外れていても必ず送る", () => {
    const items = buildScheduleMenuItems({ 2: "50" }, [lockedMenu]);

    expect(items).toContainEqual({ practice_menu_id: 1, target_value: 200 });
    expect(items).toContainEqual({ practice_menu_id: 2, target_value: 50 });
  });

  it("記録済みメニューの目標量は入力値ではなく元の値を送る", () => {
    const items = buildScheduleMenuItems({ 1: "9999" }, [lockedMenu]);

    expect(items).toEqual([{ practice_menu_id: 1, target_value: 200 }]);
  });
});

describe("validateScheduleInput", () => {
  it("曜日と日付を両方指定するとエラーになる", () => {
    expect(
      validateScheduleInput({
        title: "x",
        days_of_week: "1",
        planned_on: "2026-08-10",
      }),
    ).toContain(RECURRENCE_CONFLICT_ERROR);
  });

  it("曜日も日付も無いとエラーになる", () => {
    expect(
      validateScheduleInput({
        title: "x",
        days_of_week: null,
        planned_on: null,
      }),
    ).toContain(RECURRENCE_MISSING_ERROR);
  });

  it("どちらか一方だけならエラーにならない", () => {
    expect(
      validateScheduleInput({
        title: "x",
        days_of_week: "1",
        planned_on: null,
      }),
    ).toEqual([]);
    expect(
      validateScheduleInput({
        title: "x",
        days_of_week: null,
        planned_on: "2026-08-10",
      }),
    ).toEqual([]);
  });

  it("メニューセット未指定ならタイトルが必須", () => {
    expect(
      validateScheduleInput({ title: "", planned_on: "2026-08-10" }),
    ).toContain(TITLE_REQUIRED_ERROR);
  });

  it("メニューセットを指定すればタイトルは省略できる", () => {
    expect(
      validateScheduleInput({
        title: null,
        menu_set_id: 3,
        planned_on: "2026-08-10",
      }),
    ).toEqual([]);
  });

  it("タイトルは50文字までは通り、51文字でエラーになる", () => {
    expect(
      validateScheduleInput({
        title: "あ".repeat(50),
        planned_on: "2026-08-10",
      }),
    ).toEqual([]);
    expect(
      validateScheduleInput({
        title: "あ".repeat(51),
        planned_on: "2026-08-10",
      }),
    ).toContain(TITLE_TOO_LONG_ERROR);
  });
});
