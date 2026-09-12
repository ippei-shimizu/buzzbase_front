import type { PracticeLog, PracticeSession } from "@app/types/practice";
import { EMPTY_RECORD_SEARCH } from "@app/utils/recordListFilter";
import {
  filterPracticeSessions,
  practiceSessionDate,
} from "../_utils/practiceSessionFilter";

function buildLog(overrides: Partial<PracticeLog> = {}): PracticeLog {
  return {
    id: 1,
    practice_menu_id: 1,
    schedule_id: null,
    logged_on: "2026-07-14",
    amount: "200.0",
    weight: null,
    menu_name: "素振り",
    unit_label: "本",
    source: "manual",
    memo: null,
    created_at: "2026-07-14T10:00:00+09:00",
    ...overrides,
  };
}

function buildSession(
  overrides: Partial<PracticeSession> = {},
): PracticeSession {
  return {
    id: 1,
    logged_on: "2026-07-14",
    memo: null,
    practice_type: "self_practice" as const,
    improvement_theme_ids: [],
    practice_logs: [],
    condition: null,
    created_at: "2026-07-14T10:00:00+09:00",
    ...overrides,
  };
}

function buildCondition(
  overrides: Partial<NonNullable<PracticeSession["condition"]>> = {},
): NonNullable<PracticeSession["condition"]> {
  return {
    id: 1,
    logged_on: "2026-07-14",
    fatigue_level: null,
    physical_level: null,
    sleep_hours: null,
    mood: null,
    memo: null,
    injuries: [],
    ...overrides,
  };
}

function search(sessions: PracticeSession[], keyword: string): number[] {
  return filterPracticeSessions(sessions, {
    ...EMPTY_RECORD_SEARCH,
    keyword,
  }).map((session) => session.id);
}

describe("filterPracticeSessions（横断検索）", () => {
  const target = buildSession({ id: 1 });
  const other = buildSession({ id: 2, logged_on: "2026-06-01" });

  it("日付を検索対象にする", () => {
    expect(search([target, other], "2026-07-14")).toEqual([1]);
  });

  it("日付は「7月14日」のような和暦表記でも引ける", () => {
    expect(search([target, other], "7月14日")).toEqual([1]);
  });

  it("セッションメモを検索対象にする", () => {
    const withMemo = buildSession({ id: 1, memo: "全体的に振り遅れ気味" });

    expect(search([withMemo, other], "振り遅れ")).toEqual([1]);
  });

  it("コンディションメモを検索対象にする", () => {
    const withConditionMemo = buildSession({
      id: 1,
      condition: buildCondition({ memo: "後半は集中が切れた" }),
    });

    expect(search([withConditionMemo, other], "集中が切れた")).toEqual([1]);
  });

  it("気分を検索対象にする", () => {
    const withMood = buildSession({
      id: 1,
      condition: buildCondition({ mood: "好調" }),
    });

    expect(search([withMood, other], "好調")).toEqual([1]);
  });

  it("怪我の部位を検索対象にする", () => {
    const withInjury = buildSession({
      id: 1,
      condition: buildCondition({ injuries: [{ part: "肘", memo: "違和感" }] }),
    });

    expect(search([withInjury, other], "肘")).toEqual([1]);
  });

  it("メニュー名を検索対象にする", () => {
    const withLogs = buildSession({
      id: 1,
      practice_logs: [buildLog({ menu_name: "ロングティー" })],
    });

    expect(search([withLogs, other], "ロングティー")).toEqual([1]);
  });

  it("一致しなければ空配列（0件）を返す", () => {
    expect(search([target, other], "存在しない語")).toEqual([]);
  });
});

describe("filterPracticeSessions（日付レンジ）", () => {
  const sessions = [
    buildSession({ id: 1, logged_on: "2026-06-30" }),
    buildSession({ id: 2, logged_on: "2026-07-01" }),
    buildSession({ id: 3, logged_on: "2026-07-31" }),
    buildSession({ id: 4, logged_on: "2026-08-01" }),
  ];

  it("開始日はその日を含む", () => {
    expect(
      filterPracticeSessions(sessions, {
        ...EMPTY_RECORD_SEARCH,
        startDate: "2026-07-01",
      }).map((session) => session.id),
    ).toEqual([2, 3, 4]);
  });

  it("終了日はその日を含む", () => {
    expect(
      filterPracticeSessions(sessions, {
        ...EMPTY_RECORD_SEARCH,
        endDate: "2026-07-31",
      }).map((session) => session.id),
    ).toEqual([1, 2, 3]);
  });

  it("両端を含んで絞り込む", () => {
    expect(
      filterPracticeSessions(sessions, {
        ...EMPTY_RECORD_SEARCH,
        startDate: "2026-07-01",
        endDate: "2026-07-31",
      }).map((session) => session.id),
    ).toEqual([2, 3]);
  });
});

describe("practiceSessionDate", () => {
  it("月の集計に渡せるよう日付だけを返す", () => {
    expect(
      practiceSessionDate(
        buildSession({ logged_on: "2026-07-14T10:00:00+09:00" }),
      ),
    ).toBe("2026-07-14");
  });
});
