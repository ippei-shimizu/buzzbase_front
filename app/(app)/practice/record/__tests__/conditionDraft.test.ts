import type { ConditionLog, PracticeSession } from "@app/types/practice";
import {
  type ConditionDraft,
  EMPTY_CONDITION_DRAFT,
  buildConditionPayload,
  buildInitialCondition,
  hasConditionContent,
} from "../_utils/conditionDraft";

function buildCondition(overrides: Partial<ConditionLog> = {}): ConditionLog {
  return {
    id: 1,
    logged_on: "2026-08-03",
    fatigue_level: 3,
    physical_level: 2,
    sleep_hours: "7.5",
    mood: "普通",
    memo: "体は軽かった",
    injuries: [{ part: "肩", memo: "軽い張り" }],
    ...overrides,
  };
}

function buildSession(condition: ConditionLog | null): PracticeSession {
  return {
    id: 1,
    logged_on: "2026-08-03",
    memo: null,
    improvement_theme_ids: [],
    practice_logs: [],
    condition,
    created_at: "2026-08-03T10:00:00+09:00",
  };
}

function buildDraft(overrides: Partial<ConditionDraft> = {}): ConditionDraft {
  return { ...EMPTY_CONDITION_DRAFT, ...overrides };
}

const PRO = { hasConditionEntitlement: true, isEntitlementLoading: false };

describe("buildInitialCondition", () => {
  it("コンディションの無いセッションは空の編集状態にする", () => {
    expect(buildInitialCondition(buildSession(null))).toEqual(
      EMPTY_CONDITION_DRAFT,
    );
    expect(buildInitialCondition(null)).toEqual(EMPTY_CONDITION_DRAFT);
  });

  it("既存のコンディションを読み込む", () => {
    expect(buildInitialCondition(buildSession(buildCondition()))).toEqual({
      fatigue_level: 3,
      physical_level: 2,
      sleep_hours: "7.5",
      mood: "普通",
      memo: "体は軽かった",
      injuries: [{ part: "肩", memo: "軽い張り" }],
    });
  });

  it("文字列で返る decimal の睡眠時間を数値化してから入力欄へ渡す", () => {
    const draft = buildInitialCondition(
      buildSession(buildCondition({ sleep_hours: "7.0" })),
    );

    expect(draft.sleep_hours).toBe("7");
  });
});

describe("hasConditionContent", () => {
  it("すべて未入力なら false", () => {
    expect(hasConditionContent(EMPTY_CONDITION_DRAFT)).toBe(false);
    expect(hasConditionContent(buildDraft({ sleep_hours: "  " }))).toBe(false);
  });

  it("いずれか1つでも入力があれば true", () => {
    expect(hasConditionContent(buildDraft({ fatigue_level: 1 }))).toBe(true);
    expect(hasConditionContent(buildDraft({ physical_level: 4 }))).toBe(true);
    expect(hasConditionContent(buildDraft({ sleep_hours: "7" }))).toBe(true);
    expect(hasConditionContent(buildDraft({ mood: "好調" }))).toBe(true);
    expect(hasConditionContent(buildDraft({ memo: "眠い" }))).toBe(true);
    expect(
      hasConditionContent(buildDraft({ injuries: [{ part: "肩" }] })),
    ).toBe(true);
  });
});

describe("buildConditionPayload", () => {
  const filledDraft = buildDraft({
    fatigue_level: 4,
    physical_level: 1,
    sleep_hours: "7.5",
    mood: "好調",
    memo: " よく眠れた ",
    injuries: [{ part: "肘", memo: " 軽い張り " }],
  });

  it("entitlement が無ければ値が残っていても送らない", () => {
    expect(
      buildConditionPayload(filledDraft, {
        hasConditionEntitlement: false,
        isEntitlementLoading: false,
      }),
    ).toBeNull();
  });

  it("Pro 判定が未確定の間は送らない", () => {
    expect(
      buildConditionPayload(filledDraft, {
        hasConditionEntitlement: true,
        isEntitlementLoading: true,
      }),
    ).toBeNull();
  });

  it("入力が無ければ送らない（既存のコンディションを空で上書きしない）", () => {
    expect(buildConditionPayload(EMPTY_CONDITION_DRAFT, PRO)).toBeNull();
  });

  it("Pro なら back のキー名のまま送る", () => {
    expect(buildConditionPayload(filledDraft, PRO)).toEqual({
      fatigue_level: 4,
      physical_level: 1,
      sleep_hours: 7.5,
      mood: "好調",
      memo: "よく眠れた",
      injuries: [{ part: "肘", memo: "軽い張り" }],
    });
  });

  it("空の睡眠時間・メモは未入力として null で送る", () => {
    expect(
      buildConditionPayload(
        buildDraft({ fatigue_level: 2, sleep_hours: "", memo: "  " }),
        PRO,
      ),
    ).toEqual({
      fatigue_level: 2,
      physical_level: null,
      sleep_hours: null,
      mood: null,
      memo: null,
      injuries: [],
    });
  });
});
