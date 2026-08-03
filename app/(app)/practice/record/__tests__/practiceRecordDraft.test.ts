import type {
  PracticeLog,
  PracticeMenu,
  PracticeSession,
} from "@app/types/practice";
import {
  buildInitialAmounts,
  buildInitialWeights,
  buildItems,
  isFutureDate,
  parsePresetMenus,
  resolveInitialDate,
  toInputValue,
  todayString,
} from "../_utils/practiceRecordDraft";

function buildMenu(overrides: Partial<PracticeMenu> = {}): PracticeMenu {
  return {
    id: 1,
    name: "素振り",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: "200.0",
    is_favorite: false,
    sort_order: 1,
    ...overrides,
  };
}

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 1,
    practice_menu_id: 1,
    schedule_id: null,
    logged_on: "2026-08-01",
    amount: "300.0",
    weight: null,
    menu_name: "素振り",
    unit_label: "本",
    source: "manual",
    memo: null,
    created_at: "2026-08-01T10:00:00+09:00",
    ...overrides,
  };
}

function buildSession(logs: PracticeLog[]): PracticeSession {
  return {
    id: 10,
    logged_on: "2026-08-01",
    memo: null,
    improvement_theme_ids: [],
    practice_logs: logs,
    condition: null,
    created_at: "2026-08-01T10:00:00+09:00",
  };
}

describe("todayString", () => {
  it("Asia/Tokyo の暦日を YYYY-MM-DD で返す", () => {
    // UTC では 2026-08-02、Asia/Tokyo では 2026-08-03
    expect(todayString(new Date("2026-08-02T20:00:00Z"))).toBe("2026-08-03");
  });
});

describe("resolveInitialDate", () => {
  it("未来日が指定されたら今日へ丸める", () => {
    expect(resolveInitialDate("2026-08-10", "2026-08-03")).toBe("2026-08-03");
  });

  it("過去日はそのまま使う", () => {
    expect(resolveInitialDate("2026-07-20", "2026-08-03")).toBe("2026-07-20");
  });

  it("形式が不正な指定は今日へフォールバックする", () => {
    expect(resolveInitialDate("2026/07/20", "2026-08-03")).toBe("2026-08-03");
    expect(resolveInitialDate(undefined, "2026-08-03")).toBe("2026-08-03");
  });
});

describe("isFutureDate", () => {
  it("今日は未来日ではない", () => {
    expect(isFutureDate("2026-08-03", "2026-08-03")).toBe(false);
    expect(isFutureDate("2026-08-04", "2026-08-03")).toBe(true);
  });
});

describe("parsePresetMenus", () => {
  it("JSON 配列を解釈する", () => {
    expect(
      parsePresetMenus('[{"practice_menu_id":3,"target_value":150}]'),
    ).toEqual([{ practice_menu_id: 3, target_value: 150 }]);
  });

  it("壊れた JSON はプリセット無しとして扱う", () => {
    expect(parsePresetMenus("{{")).toEqual([]);
    expect(parsePresetMenus(undefined)).toEqual([]);
  });

  it("target_value が無い項目は null にする", () => {
    expect(parsePresetMenus('[{"practice_menu_id":3}]')).toEqual([
      { practice_menu_id: 3, target_value: null },
    ]);
  });
});

describe("toInputValue", () => {
  it("back の decimal 文字列をそのまま出さない", () => {
    expect(toInputValue("200.0")).toBe("200");
    expect(toInputValue(null)).toBe("");
  });
});

describe("buildInitialAmounts", () => {
  it("既存の記録を初期値に入れる", () => {
    const session = buildSession([buildLog({ practice_menu_id: 1 })]);
    expect(buildInitialAmounts(session, [])).toEqual({ 1: "300" });
  });

  it("素振り自動ログは編集対象に含めない", () => {
    const session = buildSession([
      buildLog({ id: 2, practice_menu_id: 5, source: "shadow_swing" }),
    ]);
    expect(buildInitialAmounts(session, [])).toEqual({});
  });

  it("既存の記録があるメニューはプリセットで上書きしない", () => {
    const session = buildSession([buildLog({ practice_menu_id: 1 })]);
    expect(
      buildInitialAmounts(session, [
        { practice_menu_id: 1, target_value: 100 },
        { practice_menu_id: 2, target_value: 50 },
      ]),
    ).toEqual({ 1: "300", 2: "50" });
  });

  it("記録が無い日は空になる", () => {
    expect(buildInitialAmounts(null, [])).toEqual({});
  });
});

describe("buildInitialWeights", () => {
  it("既存の重さを初期値に入れる", () => {
    const session = buildSession([
      buildLog({ practice_menu_id: 4, amount: "10.0", weight: "60.0" }),
    ]);
    expect(buildInitialWeights(session, [], [])).toEqual({ 4: "60" });
  });

  it("プリセットの筋トレメニューは重さを空欄で用意する", () => {
    const menus = [buildMenu({ id: 4, unit: "weight_reps" })];
    expect(
      buildInitialWeights(
        null,
        [{ practice_menu_id: 4, target_value: 10 }],
        menus,
      ),
    ).toEqual({ 4: "" });
  });
});

describe("buildItems", () => {
  it("選択中のメニューを全件送る", () => {
    expect(buildItems({ 1: "300", 2: "50" }, {})).toEqual([
      { practice_menu_id: 1, amount: 300, weight: null },
      { practice_menu_id: 2, amount: 50, weight: null },
    ]);
  });

  it("空欄は未入力として null で送る", () => {
    expect(buildItems({ 1: "" }, {})).toEqual([
      { practice_menu_id: 1, amount: null, weight: null },
    ]);
  });

  it("重さは入力があるメニューだけに付ける", () => {
    expect(buildItems({ 4: "10" }, { 4: "60" })).toEqual([
      { practice_menu_id: 4, amount: 10, weight: 60 },
    ]);
  });
});
