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

import {
  getDashboardBattingStats,
  getDashboardPitchingStats,
  getUserStatsFilterOptions,
} from "../dashboardStatsService";

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

const battingPayload = {
  aggregate: { hit: 3, at_bats: 10 },
  calculated: { batting_average: 0.3 },
};

const pitchingPayload = {
  aggregate: { win: 1 },
  calculated: { era: 2.5 },
};

describe("v2 ダッシュボード成績 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getDashboardBattingStats", () => {
    it("打撃成績エンドポイントを叩き、レスポンスをそのまま返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => battingPayload,
      });

      const result = await getDashboardBattingStats();

      expect(result).toEqual({ status: "ok", data: battingPayload });
      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/dashboard/batting_stats",
      );
      expect((global.fetch as jest.Mock).mock.calls[0][1]).toEqual(
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

    it("絞り込みをバックエンドのパラメータ名で送る", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => battingPayload,
      });

      await getDashboardBattingStats(7, {
        year: "2024",
        matchType: "regular",
        seasonId: "3",
        tournamentId: "9",
        startMonth: "2024-04",
        endMonth: "2024-06",
      });

      const url = new URL(requestedUrl());
      expect(url.pathname).toBe("/api/v2/dashboard/batting_stats");
      expect(Object.fromEntries(url.searchParams)).toEqual({
        user_id: "7",
        year: "2024",
        match_type: "regular",
        season_id: "3",
        tournament_id: "9",
        start_month: "2024-04",
        end_month: "2024-06",
      });
    });

    it("未指定の絞り込みはクエリに含めない", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => battingPayload,
      });

      await getDashboardBattingStats(7, { year: "2024" });

      const url = new URL(requestedUrl());
      expect(Object.fromEntries(url.searchParams)).toEqual({
        user_id: "7",
        year: "2024",
      });
    });

    it("403 のときは forbidden を返す（データとして扱わない）", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "このアカウントは非公開です" }),
      });

      await expect(getDashboardBattingStats(7)).resolves.toEqual({
        status: "forbidden",
      });
    });

    it("その他の失敗ステータスは error を返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(getDashboardBattingStats(7)).resolves.toEqual({
        status: "error",
      });
    });

    it("通信例外は error を返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("network down"),
      );

      await expect(getDashboardBattingStats(7)).resolves.toEqual({
        status: "error",
      });
    });

    it("未認証は error を返し、リクエストを送らない", async () => {
      mockGet.mockReturnValue(undefined);

      await expect(getDashboardBattingStats(7)).resolves.toEqual({
        status: "error",
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("getDashboardPitchingStats", () => {
    it("投手成績エンドポイントを叩く", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => pitchingPayload,
      });

      const result = await getDashboardPitchingStats(7, {
        year: "2023",
        matchType: "open",
      });

      expect(result).toEqual({ status: "ok", data: pitchingPayload });
      const url = new URL(requestedUrl());
      expect(url.pathname).toBe("/api/v2/dashboard/pitching_stats");
      expect(Object.fromEntries(url.searchParams)).toEqual({
        user_id: "7",
        year: "2023",
        match_type: "open",
      });
    });

    it("403 のときは forbidden を返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

      await expect(getDashboardPitchingStats(7)).resolves.toEqual({
        status: "forbidden",
      });
    });
  });

  describe("getUserStatsFilterOptions", () => {
    it("記録のある年度・種別とシーズンを選択肢にする", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("match_index_user_id")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              { date_and_time: "2023-05-01T10:00:00", match_type: "regular" },
              { date_and_time: "2024-08-01T10:00:00", match_type: "regular" },
            ],
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [{ id: 3, name: "2024年春" }],
        });
      });

      const options = await getUserStatsFilterOptions(7);

      expect(options.years).toEqual([
        { key: "2024", label: "2024" },
        { key: "2023", label: "2023" },
      ]);
      expect(options.matchTypes).toEqual([{ key: "regular", label: "公式戦" }]);
      expect(options.seasons).toEqual([{ key: "3", label: "2024年春" }]);
    });

    it("片方の取得が失敗しても残りの選択肢は返す", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("match_index_user_id")) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [{ id: 3, name: "2024年春" }],
        });
      });

      const options = await getUserStatsFilterOptions(7);

      expect(options.years).toEqual([]);
      expect(options.seasons).toEqual([{ key: "3", label: "2024年春" }]);
    });
  });
});
