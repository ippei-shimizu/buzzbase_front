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

import { getActivityHeatmap, getShadowSwingStats } from "../activityService";

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

function mockResponse(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const heatmapBody = {
  from: "2026-07-05",
  to: "2026-08-03",
  current_streak_days: 3,
  longest_streak_days: 12,
  total_active_days: 40,
  data: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  setupAuthCookies();
});

describe("getActivityHeatmap", () => {
  it("期間をクエリに載せて活動ログを取得する", async () => {
    mockResponse(200, heatmapBody);

    const result = await getActivityHeatmap("2025-08-04", "2026-08-03");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v2/activity_logs?from=2025-08-04&to=2026-08-03",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result).toEqual({ status: "ok", data: heatmapBody });
  });

  it("期間を省略したらクエリを付けない", async () => {
    mockResponse(200, heatmapBody);

    await getActivityHeatmap();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v2/activity_logs",
      expect.anything(),
    );
  });

  it("無料プランでクランプされた from をそのまま返す", async () => {
    mockResponse(200, heatmapBody);

    const result = await getActivityHeatmap("2025-08-04", "2026-08-03");

    expect(result).toEqual({
      status: "ok",
      data: expect.objectContaining({ from: "2026-07-05" }),
    });
  });

  it("失敗を空データに丸めない", async () => {
    mockResponse(500, {});

    expect(await getActivityHeatmap()).toEqual({ status: "error" });
  });
});

describe("getShadowSwingStats", () => {
  it("素振りの累計を取得する", async () => {
    mockResponse(200, { today_count: 0, month_count: 30, total_count: 1200 });

    const result = await getShadowSwingStats();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v2/shadow_swing_sessions/stats",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result).toEqual({
      status: "ok",
      data: { today_count: 0, month_count: 30, total_count: 1200 },
    });
  });

  it("取得できなくてもエラーとして返し、0 本とは扱わない", async () => {
    mockResponse(500, {});

    expect(await getShadowSwingStats()).toEqual({ status: "error" });
  });
});
