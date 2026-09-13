import type { ConditionLog, PracticeSession } from "@app/types/practice";
import {
  type ConditionDraft,
  EMPTY_CONDITION_DRAFT,
  buildConditionPayload,
  buildInitialCondition,
  hasBasicConditionContent,
  hasDetailConditionContent,
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
    practice_type: "self_practice" as const,
    improvement_theme_ids: [],
    practice_logs: [],
    condition,
    created_at: "2026-08-03T10:00:00+09:00",
  };
}

function buildDraft(overrides: Partial<ConditionDraft> = {}): ConditionDraft {
  return { ...EMPTY_CONDITION_DRAFT, ...overrides };
}

const PRO = { hasDetailEntitlement: true, isEntitlementLoading: false };
const FREE = { hasDetailEntitlement: false, isEntitlementLoading: false };

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

describe("hasBasicConditionContent", () => {
  it("疲労度・体調が未入力なら false", () => {
    expect(hasBasicConditionContent(EMPTY_CONDITION_DRAFT)).toBe(false);
    expect(hasBasicConditionContent(buildDraft({ mood: "好調" }))).toBe(false);
  });

  it("疲労度か体調が入力されていれば true", () => {
    expect(hasBasicConditionContent(buildDraft({ fatigue_level: 1 }))).toBe(
      true,
    );
    expect(hasBasicConditionContent(buildDraft({ physical_level: 4 }))).toBe(
      true,
    );
  });
});

describe("hasDetailConditionContent", () => {
  it("Pro 限定項目が未入力なら false", () => {
    expect(hasDetailConditionContent(EMPTY_CONDITION_DRAFT)).toBe(false);
    expect(hasDetailConditionContent(buildDraft({ sleep_hours: "  " }))).toBe(
      false,
    );
    expect(hasDetailConditionContent(buildDraft({ fatigue_level: 1 }))).toBe(
      false,
    );
  });

  it("いずれか1つでも入力があれば true", () => {
    expect(hasDetailConditionContent(buildDraft({ sleep_hours: "7" }))).toBe(
      true,
    );
    expect(hasDetailConditionContent(buildDraft({ mood: "好調" }))).toBe(true);
    expect(hasDetailConditionContent(buildDraft({ memo: "眠い" }))).toBe(true);
    expect(
      hasDetailConditionContent(buildDraft({ injuries: [{ part: "肩" }] })),
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

  it("無料ユーザーには疲労度・体調だけ送り、詳細項目はキーごと落とす", () => {
    expect(buildConditionPayload(filledDraft, FREE)).toEqual({
      fatigue_level: 4,
      physical_level: 1,
    });
  });

  it("Pro 判定が未確定の間は詳細項目を送らない（null で既存値を消さない）", () => {
    expect(
      buildConditionPayload(filledDraft, {
        hasDetailEntitlement: true,
        isEntitlementLoading: true,
      }),
    ).toEqual({ fatigue_level: 4, physical_level: 1 });
  });

  it("無料ユーザーが詳細項目しか入力していなければ送らない", () => {
    expect(
      buildConditionPayload(
        buildDraft({ sleep_hours: "7.5", mood: "好調" }),
        FREE,
      ),
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
