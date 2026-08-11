import type { Goal } from "@app/types/goal";
import {
  type GoalFormValues,
  addDays,
  buildGoalCreatePayload,
  buildGoalUpdatePayload,
  hasAutoRange,
  initialGoalFormValues,
  isMenuMetric,
  monthRange,
  resolveGoalPeriod,
  todayString,
  validateGoalForm,
  weekRange,
  yearRange,
} from "../_utils/goalForm";

const TODAY = "2026-08-03";

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
    practice_menu_unit_label: null,
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

function buildValues(overrides: Partial<GoalFormValues> = {}): GoalFormValues {
  return { ...initialGoalFormValues(null, TODAY), ...overrides };
}

describe("日付ユーティリティ", () => {
  it("todayString は Asia/Tokyo の日付を YYYY-MM-DD で返す", () => {
    // JST では翌日の 08:30。UTC 基準で計算すると 1 日ずれる。
    expect(todayString(new Date("2026-08-02T23:30:00Z"))).toBe("2026-08-03");
  });

  it("addDays は月をまたいでも正しく加算する", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("monthRange は当月の初日と末日を返す", () => {
    expect(monthRange("2026-08-03")).toEqual({
      start: "2026-08-01",
      end: "2026-08-31",
    });
    expect(monthRange("2026-02-15")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
  });

  it("weekRange は月曜始まり・日曜終わりの週を返す", () => {
    // 2026-08-03 は月曜。
    expect(weekRange("2026-08-03")).toEqual({
      start: "2026-08-03",
      end: "2026-08-09",
    });
    // 2026-08-09 は日曜。前週の月曜まで戻る。
    expect(weekRange("2026-08-09")).toEqual({
      start: "2026-08-03",
      end: "2026-08-09",
    });
  });

  it("yearRange は 1月1日〜12月31日を返す", () => {
    expect(yearRange("2026-08-03")).toEqual({
      start: "2026-01-01",
      end: "2026-12-31",
    });
  });

  it("期間が自動算出されるのは週次・月次・年間だけ", () => {
    expect(hasAutoRange("weekly")).toBe(true);
    expect(hasAutoRange("monthly")).toBe(true);
    expect(hasAutoRange("yearly")).toBe(true);
    expect(hasAutoRange("custom")).toBe(false);
    expect(hasAutoRange("season")).toBe(false);
    expect(hasAutoRange("tournament")).toBe(false);
  });
});

describe("initialGoalFormValues", () => {
  it("新規は数値目標・月次・先頭の指標を既定にする", () => {
    const values = initialGoalFormValues(null, TODAY);
    expect(values.kind).toBe("numeric");
    expect(values.periodType).toBe("monthly");
    expect(values.metricKey).toBe("practice_days");
    expect(values.targetValue).toBe("");
    expect(values.deadline).toBe(addDays(TODAY, 90));
  });

  it("編集は既存の目標から復元する", () => {
    const values = initialGoalFormValues(
      buildGoal({
        kind: "manual",
        period_type: "custom",
        custom_metric_label: "球速",
        custom_unit: "km/h",
        comparison_type: "less_than",
        target_value: 130,
        manual_current_value: 125,
        month_start: "2026-07-01",
        deadline: "2026-09-30",
      }),
      TODAY,
    );

    expect(values.kind).toBe("manual");
    expect(values.periodType).toBe("custom");
    expect(values.customMetricLabel).toBe("球速");
    expect(values.customUnit).toBe("km/h");
    expect(values.comparison).toBe("less_than");
    expect(values.targetValue).toBe("130");
    expect(values.manualCurrentValue).toBe("125");
    expect(values.startDate).toBe("2026-07-01");
    expect(values.deadline).toBe("2026-09-30");
  });

  it("back が数値を文字列で返しても入力欄には数値として流し込む", () => {
    const values = initialGoalFormValues(
      buildGoal({ kind: "manual", target_value: "130.0" }),
      TODAY,
    );
    expect(values.targetValue).toBe("130");
  });
});

describe("isMenuMetric", () => {
  it("数値目標でメニュー継続日数を選んだときだけ true", () => {
    expect(isMenuMetric(buildValues({ metricKey: "menu_practice_days" }))).toBe(
      true,
    );
    expect(isMenuMetric(buildValues({ metricKey: "practice_days" }))).toBe(
      false,
    );
    // 定性目標は指標を持たないため、metricKey が残っていても対象外。
    expect(
      isMenuMetric(
        buildValues({ kind: "qualitative", metricKey: "menu_practice_days" }),
      ),
    ).toBe(false);
  });
});

describe("resolveGoalPeriod", () => {
  it.each([
    ["monthly", "2026-08-01", "2026-08-31"],
    ["weekly", "2026-08-03", "2026-08-09"],
    ["yearly", "2026-01-01", "2026-12-31"],
  ] as const)(
    "%s は今日を基準に期間を自動算出する",
    (periodType, start, end) => {
      expect(
        resolveGoalPeriod(buildValues({ periodType }), null, TODAY),
      ).toEqual({ month_start: start, deadline: end });
    },
  );

  it("カスタム期間は入力した開始日・期限を使う", () => {
    expect(
      resolveGoalPeriod(
        buildValues({
          periodType: "custom",
          startDate: "2026-08-10",
          deadline: "2026-08-31",
        }),
        null,
        TODAY,
      ),
    ).toEqual({ month_start: "2026-08-10", deadline: "2026-08-31" });
  });

  it.each(["season", "tournament"] as const)(
    "%s は開始日を持たない",
    (periodType) => {
      expect(
        resolveGoalPeriod(
          buildValues({ periodType, deadline: "2026-10-01" }),
          null,
          TODAY,
        ),
      ).toEqual({ month_start: null, deadline: "2026-10-01" });
    },
  );

  it("編集では月次の対象期間を今日基準で振り直さない", () => {
    const editing = buildGoal({
      period_type: "monthly",
      month_start: "2026-06-01",
      deadline: "2026-06-30",
    });
    expect(
      resolveGoalPeriod(initialGoalFormValues(editing, TODAY), editing, TODAY),
    ).toEqual({ month_start: "2026-06-01", deadline: "2026-06-30" });
  });
});

describe("validateGoalForm", () => {
  it("数値目標は目標値が必須", () => {
    expect(validateGoalForm(buildValues({ targetValue: "" }))).toContain(
      "目標値を入力してください",
    );
    expect(validateGoalForm(buildValues({ targetValue: "20" }))).toEqual([]);
  });

  it("目標値 0 は未入力として扱わない", () => {
    expect(validateGoalForm(buildValues({ targetValue: "0" }))).toEqual([]);
  });

  it("目標値に負の数は入力できない", () => {
    expect(validateGoalForm(buildValues({ targetValue: "-5" }))).toEqual([
      "目標値は0以上の数値を入力してください",
    ]);
  });

  it("定性目標は目標（タイトル）が必須で、目標値は不要", () => {
    expect(
      validateGoalForm(buildValues({ kind: "qualitative", title: "" })),
    ).toEqual(["目標を入力してください"]);
    expect(
      validateGoalForm(buildValues({ kind: "qualitative", title: "優勝する" })),
    ).toEqual([]);
  });

  it("自由指標は指標名が必須", () => {
    expect(
      validateGoalForm(
        buildValues({
          kind: "manual",
          customMetricLabel: "",
          targetValue: "130",
        }),
      ),
    ).toEqual(["指標名を入力してください"]);
  });

  it("メニュー継続日数は対象メニューが必須", () => {
    expect(
      validateGoalForm(
        buildValues({
          metricKey: "menu_practice_days",
          targetValue: "20",
          practiceMenuId: null,
        }),
      ),
    ).toEqual(["対象の練習メニューを選択してください"]);
  });

  it("シーズン目標はシーズン、大会目標は大会が必須", () => {
    expect(
      validateGoalForm(
        buildValues({ periodType: "season", targetValue: "0.3" }),
      ),
    ).toEqual(["シーズンを選択してください"]);
    expect(
      validateGoalForm(
        buildValues({ periodType: "tournament", targetValue: "0.3" }),
      ),
    ).toEqual(["大会を選択してください"]);
  });

  it("カスタム期間は終了日が開始日以降であること", () => {
    expect(
      validateGoalForm(
        buildValues({
          periodType: "custom",
          targetValue: "20",
          startDate: "2026-08-10",
          deadline: "2026-08-09",
        }),
      ),
    ).toEqual(["終了日は開始日以降にしてください"]);
    expect(
      validateGoalForm(
        buildValues({
          periodType: "custom",
          targetValue: "20",
          startDate: "2026-08-10",
          deadline: "2026-08-10",
        }),
      ),
    ).toEqual([]);
  });

  it("カスタム期間は開始日・終了日のどちらも未入力を許さない", () => {
    expect(
      validateGoalForm(
        buildValues({
          periodType: "custom",
          targetValue: "20",
          startDate: "2026-08-10",
          deadline: "",
        }),
      ),
    ).toEqual(["開始日と終了日を入力してください"]);
    expect(
      validateGoalForm(
        buildValues({
          periodType: "custom",
          targetValue: "20",
          startDate: "",
          deadline: "2026-08-10",
        }),
      ),
    ).toEqual(["開始日と終了日を入力してください"]);
  });

  it("シーズン目標・大会目標は期限（日付入力のクリア等での空文字）を許さない", () => {
    expect(
      validateGoalForm(
        buildValues({
          periodType: "season",
          targetValue: "0.3",
          seasonId: 1,
          deadline: "",
        }),
      ),
    ).toEqual(["期限を入力してください"]);
    expect(
      validateGoalForm(
        buildValues({
          periodType: "tournament",
          targetValue: "0.3",
          tournamentId: 1,
          deadline: "",
        }),
      ),
    ).toEqual(["期限を入力してください"]);
  });
});

describe("buildGoalCreatePayload", () => {
  it("数値目標は指標と指標固定の達成条件を送る", () => {
    const payload = buildGoalCreatePayload(
      buildValues({ metricKey: "era", targetValue: "2.5", title: "防御率" }),
      TODAY,
    );
    expect(payload).toEqual({
      title: "防御率",
      kind: "numeric",
      period_type: "monthly",
      season_id: null,
      tournament_id: null,
      month_start: "2026-08-01",
      deadline: "2026-08-31",
      metric_key: "era",
      target_value: 2.5,
      comparison_type: "less_than",
      practice_menu_id: null,
    });
  });

  it("達成条件は指標ごとの定義に従い、フォームの条件では上書きされない", () => {
    const payload = buildGoalCreatePayload(
      buildValues({
        metricKey: "batting_average",
        targetValue: "0.3",
        comparison: "less_than",
      }),
      TODAY,
    );
    expect(payload.comparison_type).toBe("greater_than");
  });

  it("定性目標は指標・目標値・達成条件を一切送らない", () => {
    const payload = buildGoalCreatePayload(
      buildValues({
        kind: "qualitative",
        periodType: "tournament",
        tournamentId: 7,
        title: "優勝する",
      }),
      TODAY,
    );
    expect(payload).toEqual({
      title: "優勝する",
      kind: "qualitative",
      period_type: "tournament",
      season_id: null,
      tournament_id: 7,
      month_start: null,
      deadline: payload.deadline,
    });
    expect(payload).not.toHaveProperty("metric_key");
    expect(payload).not.toHaveProperty("target_value");
  });

  it("自由指標は指標名・単位・現在値とユーザーが選んだ条件を送る", () => {
    const payload = buildGoalCreatePayload(
      buildValues({
        kind: "manual",
        customMetricLabel: " 球速 ",
        customUnit: " km/h ",
        targetValue: "130",
        manualCurrentValue: "125",
        comparison: "greater_than",
        title: "",
      }),
      TODAY,
    );
    expect(payload).toMatchObject({
      title: "球速",
      kind: "manual",
      custom_metric_label: "球速",
      custom_unit: "km/h",
      target_value: 130,
      comparison_type: "greater_than",
      manual_current_value: 125,
    });
    expect(payload).not.toHaveProperty("metric_key");
  });

  it("自由指標の現在値が未入力なら 0 を送る", () => {
    const payload = buildGoalCreatePayload(
      buildValues({
        kind: "manual",
        customMetricLabel: "体重",
        targetValue: "70",
        manualCurrentValue: "",
      }),
      TODAY,
    );
    expect(payload.manual_current_value).toBe(0);
    expect(payload.custom_unit).toBeNull();
  });

  it("メニュー継続日数のときだけ practice_menu_id を送る", () => {
    expect(
      buildGoalCreatePayload(
        buildValues({
          metricKey: "menu_practice_days",
          practiceMenuId: 3,
          targetValue: "20",
        }),
        TODAY,
      ).practice_menu_id,
    ).toBe(3);

    expect(
      buildGoalCreatePayload(
        buildValues({
          metricKey: "practice_days",
          practiceMenuId: 3,
          targetValue: "20",
        }),
        TODAY,
      ).practice_menu_id,
    ).toBeNull();
  });

  it("シーズン以外では season_id を、大会以外では tournament_id を送らない", () => {
    const payload = buildGoalCreatePayload(
      buildValues({
        periodType: "monthly",
        seasonId: 5,
        tournamentId: 6,
        targetValue: "20",
      }),
      TODAY,
    );
    expect(payload.season_id).toBeNull();
    expect(payload.tournament_id).toBeNull();
  });

  it("タイトル未入力なら指標名から補う", () => {
    expect(
      buildGoalCreatePayload(
        buildValues({ metricKey: "home_runs", targetValue: "10", title: "" }),
        TODAY,
      ).title,
    ).toBe("本塁打目標");
  });
});

describe("buildGoalUpdatePayload", () => {
  const IMMUTABLE_KEYS = [
    "kind",
    "period_type",
    "season_id",
    "tournament_id",
    "metric_key",
    "comparison_type",
    "practice_menu_id",
  ];

  it("back が更新を許可しない属性を一切含めない", () => {
    const editing = buildGoal({
      period_type: "custom",
      month_start: "2026-08-01",
      metric_key: "batting_average",
      comparison_type: "greater_than",
      practice_menu_id: 3,
      season_id: 2,
      tournament_id: 4,
    });
    const payload = buildGoalUpdatePayload(
      {
        ...initialGoalFormValues(editing, TODAY),
        // 万一 UI 側で変更されても送信対象にならないこと。
        kind: "manual",
        periodType: "season",
        metricKey: "era",
        comparison: "less_than",
        practiceMenuId: 99,
        seasonId: 99,
        tournamentId: 99,
        title: "更新後",
        targetValue: "0.35",
      },
      editing,
      TODAY,
    );

    IMMUTABLE_KEYS.forEach((key) => expect(payload).not.toHaveProperty(key));
    expect(Object.keys(payload).sort()).toEqual([
      "custom_metric_label",
      "custom_unit",
      "deadline",
      "manual_current_value",
      "month_start",
      "target_value",
      "title",
    ]);
  });

  it("数値目標の更新はタイトル・期間・目標値だけを送る", () => {
    const editing = buildGoal();
    const payload = buildGoalUpdatePayload(
      {
        ...initialGoalFormValues(editing, TODAY),
        title: "月25日練習",
        targetValue: "25",
      },
      editing,
      TODAY,
    );
    expect(payload).toEqual({
      title: "月25日練習",
      month_start: "2026-08-01",
      deadline: "2026-08-31",
      target_value: 25,
    });
  });

  it("定性目標の更新は目標値を送らない", () => {
    const editing = buildGoal({
      kind: "qualitative",
      metric_key: null,
      target_value: null,
      period_type: "tournament",
      tournament_id: 7,
      month_start: null,
    });
    const payload = buildGoalUpdatePayload(
      { ...initialGoalFormValues(editing, TODAY), title: "全国大会で優勝" },
      editing,
      TODAY,
    );
    expect(payload).toEqual({
      title: "全国大会で優勝",
      month_start: null,
      deadline: editing.deadline,
    });
  });

  it("自由指標の更新は指標名・単位・現在値も送る", () => {
    const editing = buildGoal({
      kind: "manual",
      metric_key: null,
      custom_metric_label: "球速",
      custom_unit: "km/h",
      target_value: 130,
      manual_current_value: 125,
    });
    const payload = buildGoalUpdatePayload(
      { ...initialGoalFormValues(editing, TODAY), manualCurrentValue: "128" },
      editing,
      TODAY,
    );
    expect(payload).toMatchObject({
      custom_metric_label: "球速",
      custom_unit: "km/h",
      target_value: 130,
      manual_current_value: 128,
    });
  });
});
