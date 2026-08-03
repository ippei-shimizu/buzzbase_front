import type { Goal, GoalBadge } from "@app/types/goal";
import {
  formatMonthKeyJa,
  hasAchievementSummary,
  isDateInMonth,
  monthKeyOf,
  previousMonthKey,
  summarizeAchievements,
} from "../_utils/achievementSummary";

function buildGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "月20日練習",
    kind: "numeric",
    period_type: "monthly",
    season_id: null,
    tournament_id: null,
    month_start: "2026-07-01",
    deadline: "2026-07-31",
    metric_key: "practice_days",
    target_value: 20,
    comparison_type: "greater_than",
    practice_menu_id: null,
    practice_menu_name: null,
    custom_metric_label: null,
    custom_unit: null,
    manual_current_value: 0,
    is_achieved: false,
    is_finalized: true,
    achieved_value: 20,
    current_value: 20,
    progress_percent: 100,
    days_remaining: 0,
    ...overrides,
  };
}

function buildBadge(overrides: Partial<GoalBadge> = {}): GoalBadge {
  return {
    id: 1,
    badge_type: "monthly_achieved",
    badge_name: "月間目標達成",
    awarded_at: "2026-08-01T00:05:00.000+09:00",
    goal_id: 1,
    goal_title: "月20日練習",
    ...overrides,
  };
}

describe("previousMonthKey", () => {
  it("直前に終わった月を返す", () => {
    expect(previousMonthKey(new Date("2026-08-03T12:00:00+09:00"))).toBe(
      "2026-07",
    );
  });

  it("1月は前年12月を返す", () => {
    expect(previousMonthKey(new Date("2026-01-15T12:00:00+09:00"))).toBe(
      "2025-12",
    );
  });

  it("月初 0 時ちょうどでも前月を返す", () => {
    expect(previousMonthKey(new Date("2026-08-01T00:00:00+09:00"))).toBe(
      "2026-07",
    );
  });

  it("月末 23:59 はまだ当月なので前々月ではなく前月を返す", () => {
    expect(previousMonthKey(new Date("2026-07-31T23:59:00+09:00"))).toBe(
      "2026-06",
    );
  });

  it("UTC ではまだ前月でも Asia/Tokyo で月が変わっていれば新しい月として扱う", () => {
    // UTC 2026-01-31 15:30 = JST 2026-02-01 00:30。UTC 判定だと 2025-12 になってしまう。
    expect(previousMonthKey(new Date("2026-01-31T15:30:00Z"))).toBe("2026-01");
  });

  it("UTC で年が変わる前でも Asia/Tokyo で年が明けていれば前年12月を返す", () => {
    // UTC 2025-12-31 16:00 = JST 2026-01-01 01:00。
    expect(previousMonthKey(new Date("2025-12-31T16:00:00Z"))).toBe("2025-12");
  });
});

describe("monthKeyOf", () => {
  it("日付のみの値はタイムゾーン変換せずそのまま月を切り出す", () => {
    expect(monthKeyOf("2026-07-01")).toBe("2026-07");
    expect(monthKeyOf("2026-07-31")).toBe("2026-07");
  });

  it("日時は Asia/Tokyo の月に変換する", () => {
    // JST 2026-08-01 00:30 は 7 月ではなく 8 月。
    expect(monthKeyOf("2026-07-31T15:30:00Z")).toBe("2026-08");
    expect(monthKeyOf("2026-08-01T00:30:00+09:00")).toBe("2026-08");
  });

  it("解釈できない値はどの月にも一致しない", () => {
    expect(monthKeyOf("")).toBe("");
    expect(isDateInMonth("不正な日付", "2026-07")).toBe(false);
  });
});

describe("isDateInMonth", () => {
  it("月内の日付だけ true を返す", () => {
    expect(isDateInMonth("2026-07-31", "2026-07")).toBe(true);
    expect(isDateInMonth("2026-08-01", "2026-07")).toBe(false);
    expect(isDateInMonth("2026-06-30", "2026-07")).toBe(false);
  });

  it("年が違えば同じ月番号でも false", () => {
    expect(isDateInMonth("2025-12-31", "2026-12")).toBe(false);
  });
});

describe("formatMonthKeyJa", () => {
  it("先頭 0 を落とした日本語表記にする", () => {
    expect(formatMonthKeyJa("2026-07")).toBe("2026年7月");
    expect(formatMonthKeyJa("2025-12")).toBe("2025年12月");
  });
});

describe("summarizeAchievements", () => {
  const monthKey = "2026-07";

  it("対象月に期限を迎えた確定済み目標を分母、達成を分子に数える", () => {
    const history = [
      buildGoal({ id: 1, deadline: "2026-07-31", is_achieved: true }),
      buildGoal({ id: 2, deadline: "2026-07-01", is_achieved: false }),
      buildGoal({ id: 3, deadline: "2026-07-15", is_achieved: true }),
    ];

    const summary = summarizeAchievements(history, [], monthKey);

    expect(summary.finalizedCount).toBe(3);
    expect(summary.achievedCount).toBe(2);
  });

  it("対象月以外に期限を迎えた目標は数えない", () => {
    const history = [
      buildGoal({ id: 1, deadline: "2026-06-30", is_achieved: true }),
      buildGoal({ id: 2, deadline: "2026-08-01", is_achieved: true }),
      buildGoal({ id: 3, deadline: "2026-07-31", is_achieved: true }),
    ];

    const summary = summarizeAchievements(history, [], monthKey);

    expect(summary.finalizedCount).toBe(1);
    expect(summary.achievedCount).toBe(1);
  });

  it("未確定の目標は期限が対象月でも数えない", () => {
    const history = [
      buildGoal({ id: 1, deadline: "2026-07-31", is_finalized: false }),
    ];

    expect(summarizeAchievements(history, [], monthKey).finalizedCount).toBe(0);
  });

  it("対象月に付与されたバッジだけを数える", () => {
    const badges = [
      buildBadge({ id: 1, awarded_at: "2026-07-02T09:00:00.000+09:00" }),
      buildBadge({ id: 2, awarded_at: "2026-07-31T23:00:00.000+09:00" }),
      buildBadge({ id: 3, awarded_at: "2026-08-01T00:05:00.000+09:00" }),
    ];

    expect(summarizeAchievements([], badges, monthKey).badgeCount).toBe(2);
  });

  it("達成もバッジも 0 件なら 0 を返す", () => {
    const history = [buildGoal({ deadline: "2026-07-31", is_achieved: false })];

    const summary = summarizeAchievements(history, [], monthKey);

    expect(summary).toEqual({
      finalizedCount: 1,
      achievedCount: 0,
      badgeCount: 0,
    });
  });
});

describe("hasAchievementSummary", () => {
  it("期限を迎えた目標が 1 件でもあれば振り返る対象がある", () => {
    expect(
      hasAchievementSummary({
        finalizedCount: 1,
        achievedCount: 0,
        badgeCount: 0,
      }),
    ).toBe(true);
  });

  it("期限を迎えた目標が無ければ振り返る対象が無い", () => {
    expect(
      hasAchievementSummary({
        finalizedCount: 0,
        achievedCount: 0,
        badgeCount: 0,
      }),
    ).toBe(false);
  });
});
