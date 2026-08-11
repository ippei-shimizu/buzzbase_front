const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import type { Goal } from "@app/types/goal";
import {
  getGoalSeasonOptions,
  getGoalTournamentOptions,
} from "@app/(app)/goals/actions";
import {
  achieveGoal,
  createGoal,
  deleteGoal,
  getGoalHistory,
  getGoals,
  unachieveGoal,
  updateGoal,
} from "../goalService";

function setupAuthCookies() {
  mockGet.mockImplementation((key: string) => {
    const values: Record<string, { value: string }> = {
      "access-token": { value: "test-access-token" },
      client: { value: "test-client" },
      uid: { value: "test-uid" },
    };
    return values[key];
  });
}

function requestedUrl(callIndex = 0): string {
  return (global.fetch as jest.Mock).mock.calls[callIndex][0] as string;
}

function requestedInit(callIndex = 0): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[callIndex][1] as RequestInit;
}

function sentGoalPayload(callIndex = 0): Record<string, unknown> {
  const body = JSON.parse(requestedInit(callIndex).body as string) as {
    goal: Record<string, unknown>;
  };
  return body.goal;
}

function mockJsonResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const goal = {
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
} satisfies Goal;

describe("v2 目標 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  it("getGoals は進行中一覧のエンドポイントを叩く", async () => {
    mockJsonResponse([goal]);

    const result = await getGoals();

    expect(result).toEqual({ status: "ok", data: [goal] });
    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals");
    expect(requestedInit()).toEqual(
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          "access-token": "test-access-token",
          client: "test-client",
          uid: "test-uid",
        }),
      }),
    );
  });

  it("getGoalHistory は履歴のエンドポイントを叩く", async () => {
    mockJsonResponse([]);

    await getGoalHistory();

    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals/history");
  });

  it("createGoal は POST で goal キーに包んで送る", async () => {
    mockJsonResponse(goal, 201);

    const result = await createGoal({
      title: "月20日練習",
      kind: "numeric",
      period_type: "monthly",
      month_start: "2026-08-01",
      deadline: "2026-08-31",
      metric_key: "practice_days",
      target_value: 20,
      comparison_type: "greater_than",
    });

    expect(result).toEqual({ ok: true, data: goal });
    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals");
    expect(requestedInit().method).toBe("POST");
    expect(sentGoalPayload()).toMatchObject({
      period_type: "monthly",
      metric_key: "practice_days",
      target_value: 20,
    });
  });

  it("updateGoal は PATCH で id 付きのパスを叩く", async () => {
    mockJsonResponse(goal);

    await updateGoal(7, {
      title: "月25日練習",
      month_start: "2026-08-01",
      deadline: "2026-08-31",
      target_value: 25,
    });

    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals/7");
    expect(requestedInit().method).toBe("PATCH");
    expect(sentGoalPayload()).toEqual({
      title: "月25日練習",
      month_start: "2026-08-01",
      deadline: "2026-08-31",
      target_value: 25,
    });
  });

  it("deleteGoal は DELETE で id 付きのパスを叩く", async () => {
    mockJsonResponse({ message: "削除しました" });

    await deleteGoal(7);

    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals/7");
    expect(requestedInit().method).toBe("DELETE");
  });

  it("achieveGoal は achievement へ POST する", async () => {
    mockJsonResponse({ ...goal, is_achieved: true });

    await achieveGoal(7);

    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals/7/achievement");
    expect(requestedInit().method).toBe("POST");
  });

  it("unachieveGoal は achievement へ DELETE する", async () => {
    mockJsonResponse(goal);

    await unachieveGoal(7);

    expect(requestedUrl()).toBe("http://back:3000/api/v2/goals/7/achievement");
    expect(requestedInit().method).toBe("DELETE");
  });

  it("403 は forbidden として返し、back のメッセージを保つ", async () => {
    mockJsonResponse({ error: "シーズン目標は Pro プラン限定です" }, 403);

    const result = await createGoal({
      title: "シーズン打率",
      kind: "numeric",
      period_type: "season",
      deadline: "2026-12-31",
    });

    expect(result).toEqual({
      ok: false,
      reason: "forbidden",
      errors: ["シーズン目標は Pro プラン限定です"],
    });
  });

  it("422 は error として返す（403 と取り違えない）", async () => {
    mockJsonResponse({ errors: ["目標値を入力してください"] }, 422);

    const result = await createGoal({
      title: "月20日練習",
      kind: "numeric",
      period_type: "monthly",
      deadline: "2026-08-31",
    });

    expect(result).toEqual({
      ok: false,
      reason: "error",
      errors: ["目標値を入力してください"],
    });
  });

  it("数値目標の手動達成が 422 になったらエラーとして返す", async () => {
    mockJsonResponse(
      { error: "数値目標は自動判定のため手動で達成にできません" },
      422,
    );

    const result = await achieveGoal(7);

    expect(result).toEqual({
      ok: false,
      reason: "error",
      errors: ["数値目標は自動判定のため手動で達成にできません"],
    });
  });

  it("目標フォームのシーズン候補は自分のシーズン一覧を取得する", async () => {
    mockJsonResponse([{ id: 1, name: "2026年" }]);

    const result = await getGoalSeasonOptions();

    expect(result).toEqual({ status: "ok", data: [{ id: 1, name: "2026年" }] });
    expect(requestedUrl()).toBe("http://back:3000/api/v1/seasons");
  });

  it("目標フォームの大会候補は自分の試合に紐づく大会だけを取得する", async () => {
    mockJsonResponse([{ id: 2, name: "夏の大会" }]);

    await getGoalTournamentOptions();

    expect(requestedUrl()).toBe(
      "http://back:3000/api/v1/tournaments/user_tournaments",
    );
  });
});
