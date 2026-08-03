import type { Goal } from "@app/types/goal";
import {
  goalForbiddenFeature,
  lockedGoalFeature,
} from "../_utils/goalEntitlement";
import {
  canToggleAchievement,
  categorizeGoal,
  countPersonalPeriodGoals,
  groupGoalsByPeriod,
  groupGoalsByTab,
  isAtGoalFreeLimit,
  isGoalEditable,
  progressBarWidth,
} from "../_utils/goalList";

function buildGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "月20日練習",
    kind: "numeric",
    period_type: "monthly",
    season_id: null,
    tournament_id: null,
    month_start: "2026-08-01",
    deadline: "2026-08-31",
    metric_key: "practice_days",
    target_value: 20,
    comparison_type: "greater_than",
    practice_menu_id: null,
    practice_menu_name: null,
    custom_metric_label: null,
    custom_unit: null,
    manual_current_value: 0,
    is_achieved: false,
    is_finalized: false,
    achieved_value: null,
    current_value: 5,
    progress_percent: 25,
    days_remaining: 28,
    ...overrides,
  };
}

describe("categorizeGoal", () => {
  it("未達成・未確定は進行中", () => {
    expect(
      categorizeGoal(buildGoal({ is_achieved: false, is_finalized: false })),
    ).toBe("in_progress");
  });

  it("達成済みは確定前でも達成タブに入る", () => {
    expect(
      categorizeGoal(buildGoal({ is_achieved: true, is_finalized: false })),
    ).toBe("achieved");
  });

  it("達成して確定したものも達成タブに入る", () => {
    expect(
      categorizeGoal(buildGoal({ is_achieved: true, is_finalized: true })),
    ).toBe("achieved");
  });

  it("未達成のまま確定したものだけが未達タブに入る", () => {
    expect(
      categorizeGoal(buildGoal({ is_achieved: false, is_finalized: true })),
    ).toBe("unachieved");
  });
});

describe("groupGoalsByTab", () => {
  it("進行中と履歴をまとめて3タブへ分類する", () => {
    const buckets = groupGoalsByTab(
      [
        buildGoal({ id: 1 }),
        buildGoal({ id: 2, is_achieved: true }),
        buildGoal({ id: 3 }),
      ],
      [
        buildGoal({ id: 4, is_finalized: true, is_achieved: true }),
        buildGoal({ id: 5, is_finalized: true }),
      ],
    );

    expect(buckets.in_progress.map((goal) => goal.id)).toEqual([1, 3]);
    expect(buckets.achieved.map((goal) => goal.id)).toEqual([2, 4]);
    expect(buckets.unachieved.map((goal) => goal.id)).toEqual([5]);
  });
});

describe("groupGoalsByPeriod", () => {
  it("期間タイプ順に並べ、0件の期間は返さない", () => {
    const groups = groupGoalsByPeriod([
      buildGoal({ id: 1, period_type: "season" }),
      buildGoal({ id: 2, period_type: "weekly" }),
      buildGoal({ id: 3, period_type: "monthly" }),
      buildGoal({ id: 4, period_type: "weekly" }),
    ]);

    expect(groups.map((group) => group.periodType)).toEqual([
      "weekly",
      "monthly",
      "season",
    ]);
    expect(groups[0].goals.map((goal) => goal.id)).toEqual([2, 4]);
  });
});

describe("progressBarWidth", () => {
  it("0〜100 はそのまま使う", () => {
    expect(progressBarWidth(0)).toBe(0);
    expect(progressBarWidth(42.5)).toBe(42.5);
    expect(progressBarWidth(100)).toBe(100);
  });

  it("範囲外は枠から溢れないよう丸める", () => {
    expect(progressBarWidth(140)).toBe(100);
    expect(progressBarWidth(-10)).toBe(0);
  });

  it("不正な値は 0 にする", () => {
    expect(progressBarWidth(Number.NaN)).toBe(0);
    expect(progressBarWidth(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("canToggleAchievement", () => {
  it("進行中の定性目標だけ達成トグルを出す", () => {
    expect(canToggleAchievement(buildGoal({ kind: "qualitative" }))).toBe(true);
  });

  it.each(["numeric", "manual"] as const)(
    "%s 目標には出さない（back が 422 を返すため）",
    (kind) => {
      expect(canToggleAchievement(buildGoal({ kind }))).toBe(false);
    },
  );

  it("確定済みの定性目標には出さない", () => {
    expect(
      canToggleAchievement(
        buildGoal({ kind: "qualitative", is_finalized: true }),
      ),
    ).toBe(false);
  });
});

describe("isGoalEditable", () => {
  it("確定済みは編集できない", () => {
    expect(isGoalEditable(buildGoal())).toBe(true);
    expect(isGoalEditable(buildGoal({ is_finalized: true }))).toBe(false);
  });
});

describe("countPersonalPeriodGoals", () => {
  it("週次・月次・年間・カスタム期間だけを数える", () => {
    expect(
      countPersonalPeriodGoals([
        buildGoal({ id: 1, period_type: "weekly" }),
        buildGoal({ id: 2, period_type: "monthly" }),
        buildGoal({ id: 3, period_type: "yearly" }),
        buildGoal({ id: 4, period_type: "custom" }),
        buildGoal({ id: 5, period_type: "season" }),
        buildGoal({ id: 6, period_type: "tournament" }),
      ]),
    ).toBe(4);
  });
});

describe("isAtGoalFreeLimit", () => {
  const twoPersonalGoals = [
    buildGoal({ id: 1, period_type: "monthly" }),
    buildGoal({ id: 2, period_type: "weekly" }),
  ];

  it("無料で個人の期間目標が2件あれば上限", () => {
    expect(
      isAtGoalFreeLimit({
        activeGoals: twoPersonalGoals,
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(true);
  });

  it("1件なら上限ではない", () => {
    expect(
      isAtGoalFreeLimit({
        activeGoals: twoPersonalGoals.slice(0, 1),
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });

  it("シーズン・大会目標は無料枠を消費しない", () => {
    expect(
      isAtGoalFreeLimit({
        activeGoals: [
          buildGoal({ id: 1, period_type: "season" }),
          buildGoal({ id: 2, period_type: "tournament" }),
        ],
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });

  it("Pro なら件数に関係なく上限にしない", () => {
    expect(
      isAtGoalFreeLimit({
        activeGoals: twoPersonalGoals,
        hasUnlimited: true,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });

  it("Pro 判定が未確定の間は上限扱いにしない", () => {
    expect(
      isAtGoalFreeLimit({
        activeGoals: twoPersonalGoals,
        hasUnlimited: false,
        isEntitlementLoading: true,
      }),
    ).toBe(false);
  });

  it("上限を超えて保有していても既存分は数えるだけで、削除は要求しない", () => {
    // Pro 解約後（グランドファザリング）を想定。新規作成だけがブロックされる。
    const overLimit = [
      ...twoPersonalGoals,
      buildGoal({ id: 3, period_type: "yearly" }),
      buildGoal({ id: 4, period_type: "custom" }),
    ];
    expect(
      isAtGoalFreeLimit({
        activeGoals: overLimit,
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(true);
    expect(overLimit.every(isGoalEditable)).toBe(true);
  });

  it("確定済みの目標は無料枠を消費しない（active のみ渡す前提）", () => {
    expect(
      isAtGoalFreeLimit({
        activeGoals: [buildGoal({ id: 1, period_type: "monthly" })],
        hasUnlimited: false,
        isEntitlementLoading: false,
      }),
    ).toBe(false);
  });
});

describe("lockedGoalFeature", () => {
  const denyAll = () => false;
  const allowAll = () => true;

  it.each([
    ["season", "season_goals"],
    ["tournament", "tournament_goals"],
    ["custom", "custom_period_goals"],
  ] as const)("%s は %s でゲートする", (periodType, feature) => {
    expect(lockedGoalFeature({ kind: "numeric", periodType }, denyAll)).toBe(
      feature,
    );
    expect(
      lockedGoalFeature({ kind: "numeric", periodType }, allowAll),
    ).toBeNull();
  });

  it("自由指標は manual_metric_goals でゲートする", () => {
    expect(
      lockedGoalFeature({ kind: "manual", periodType: "monthly" }, denyAll),
    ).toBe("manual_metric_goals");
  });

  it("自由指標×カスタム期間は back と同じく自由指標を先に案内する", () => {
    expect(
      lockedGoalFeature({ kind: "manual", periodType: "custom" }, denyAll),
    ).toBe("manual_metric_goals");
  });

  it("個人の期間目標（週次・月次・年間）は Pro 限定ではない", () => {
    (["weekly", "monthly", "yearly"] as const).forEach((periodType) => {
      expect(
        lockedGoalFeature({ kind: "numeric", periodType }, denyAll),
      ).toBeNull();
    });
  });

  it("対象の entitlement だけを見る（別の Pro 機能では解放されない）", () => {
    const onlySeason = (feature: string) => feature === "season_goals";
    expect(
      lockedGoalFeature({ kind: "numeric", periodType: "season" }, onlySeason),
    ).toBeNull();
    expect(
      lockedGoalFeature(
        { kind: "numeric", periodType: "tournament" },
        onlySeason,
      ),
    ).toBe("tournament_goals");
    expect(
      lockedGoalFeature({ kind: "numeric", periodType: "custom" }, onlySeason),
    ).toBe("custom_period_goals");
    expect(
      lockedGoalFeature({ kind: "manual", periodType: "monthly" }, onlySeason),
    ).toBe("manual_metric_goals");
  });
});

describe("goalForbiddenFeature", () => {
  it.each([
    ["season", "season_goals"],
    ["tournament", "tournament_goals"],
    ["custom", "custom_period_goals"],
  ] as const)("%s の 403 は %s が原因", (periodType, feature) => {
    expect(goalForbiddenFeature({ kind: "numeric", periodType })).toBe(feature);
  });

  it.each(["weekly", "monthly", "yearly"] as const)(
    "%s の 403 は件数上限が原因",
    (periodType) => {
      expect(goalForbiddenFeature({ kind: "numeric", periodType })).toBe(
        "unlimited_monthly_goals",
      );
    },
  );

  it("自由指標は期間タイプより先に判定する（back の render_limit_error と同順）", () => {
    expect(goalForbiddenFeature({ kind: "manual", periodType: "custom" })).toBe(
      "manual_metric_goals",
    );
    expect(
      goalForbiddenFeature({ kind: "manual", periodType: "monthly" }),
    ).toBe("manual_metric_goals");
  });

  it("定性目標は種類でゲートされない（期間タイプで決まる）", () => {
    expect(
      goalForbiddenFeature({ kind: "qualitative", periodType: "tournament" }),
    ).toBe("tournament_goals");
    expect(
      goalForbiddenFeature({ kind: "qualitative", periodType: "monthly" }),
    ).toBe("unlimited_monthly_goals");
  });
});
