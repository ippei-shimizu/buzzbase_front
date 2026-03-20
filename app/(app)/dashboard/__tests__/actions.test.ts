/**
 * app dashboard server actions のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */

// next/headers の cookies() をモック
const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

// RAILS_API_URL をモック
jest.mock("../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

// next/server をモック
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

import {
  getDashboardData,
  getAvailableSeasons,
  getFilteredBattingStats,
  getFilteredPitchingStats,
} from "../actions";

describe("app dashboard server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 認証済みクッキーをセットアップするヘルパー
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

  describe("getDashboardData", () => {
    const mockDashboardData = {
      recent_game_results: [],
      batting_stats: { aggregate: null, calculated: null },
      pitching_stats: { aggregate: null, calculated: null },
      group_rankings: [],
      available_years: [2024, 2023],
    };

    it("認証済みの場合、ダッシュボードデータを返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData,
      });

      const result = await getDashboardData();

      expect(result).toEqual(mockDashboardData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v2/dashboard",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "access-token": "test-access-token",
            client: "test-client",
            uid: "test-uid",
          }),
          cache: "no-store",
        }),
      );
    });

    it("年を指定した場合、クエリパラメータに反映される", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData,
      });

      await getDashboardData("2024");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("year=2024"),
        expect.any(Object),
      );
    });

    it("「通算」を指定した場合、yearパラメータは追加されない", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData,
      });

      await getDashboardData("通算");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v2/dashboard",
        expect.any(Object),
      );
    });

    it("クッキーがない場合、nullを返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getDashboardData();

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("APIがエラーを返した場合、nullを返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getDashboardData();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("fetchがエラーをスローした場合、nullを返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getDashboardData();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("getAvailableSeasons", () => {
    it("認証済みの場合、シーズン一覧を返す", async () => {
      setupAuthCookies();
      const mockSeasons = [
        { id: 1, name: "2024年シーズン" },
        { id: 2, name: "2023年シーズン" },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeasons,
      });

      const result = await getAvailableSeasons();

      expect(result).toEqual(mockSeasons);
    });

    it("クッキーがない場合、空配列を返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getAvailableSeasons();

      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("APIがエラーを返した場合、空配列を返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getAvailableSeasons();

      expect(result).toEqual([]);
    });
  });

  describe("getFilteredBattingStats", () => {
    const mockBattingStats = {
      aggregate: { hit: 10, at_bats: 30 },
      calculated: { batting_average: 0.333 },
    };

    it("認証済みの場合、打撃成績を返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBattingStats,
      });

      const result = await getFilteredBattingStats();

      expect(result).toEqual(mockBattingStats);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v2/dashboard/batting_stats",
        expect.any(Object),
      );
    });

    it("シーズンIDを指定した場合、クエリに反映される", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBattingStats,
      });

      await getFilteredBattingStats(undefined, undefined, "5");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("season_id=5"),
        expect.any(Object),
      );
    });

    it("クッキーがない場合、nullを返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getFilteredBattingStats();

      expect(result).toBeNull();
    });

    it("APIがエラーを返した場合、nullを返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getFilteredBattingStats();

      expect(result).toBeNull();
    });
  });

  describe("getFilteredPitchingStats", () => {
    const mockPitchingStats = {
      aggregate: { win: 5, loss: 3 },
      calculated: { era: 2.5 },
    };

    it("認証済みの場合、投球成績を返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPitchingStats,
      });

      const result = await getFilteredPitchingStats();

      expect(result).toEqual(mockPitchingStats);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v2/dashboard/pitching_stats",
        expect.any(Object),
      );
    });

    it("クッキーがない場合、nullを返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getFilteredPitchingStats();

      expect(result).toBeNull();
    });

    it("APIがエラーを返した場合、nullを返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getFilteredPitchingStats();

      expect(result).toBeNull();
    });
  });
});
