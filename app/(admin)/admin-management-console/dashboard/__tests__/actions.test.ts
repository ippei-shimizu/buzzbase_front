/**
 * admin dashboard server actions のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */

// getAdminUser と generateInternalJWT をモック
jest.mock("../../../../../lib/admin-auth", () => ({
  getAdminUser: jest.fn(),
}));
jest.mock("../../../../../lib/internal-jwt", () => ({
  generateInternalJWT: jest.fn(() => "test-jwt-token"),
}));

// RAILS_API_URL をモック
jest.mock("../../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

// next/server をモック（NextRequest の import 用）
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

import { getAdminUser } from "../../../../../lib/admin-auth";
import { getDashboardStats, getUserAnalytics } from "../actions";

const mockGetAdminUser = getAdminUser as jest.MockedFunction<
  typeof getAdminUser
>;

describe("admin dashboard server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getDashboardStats", () => {
    const mockAdminUser = { id: 1, email: "admin@example.com", name: "Admin" };
    const mockDashboardStats = {
      total_users: 1000,
      daily_active_users: 50,
      new_registrations: 10,
      monthly_active_users: 300,
      user_growth_data: [],
      activity_data: [],
    };

    it("認証済みの場合、ダッシュボード統計を返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardStats,
      });

      const result = await getDashboardStats();

      expect(result).toEqual(mockDashboardStats);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/v1/admin/analytics/dashboard?period=30&granularity=daily",
        ),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt-token",
          }),
        }),
      );
    });

    it("期間と粒度を指定した場合、クエリパラメータに反映される", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardStats,
      });

      await getDashboardStats(7, "weekly");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("period=7&granularity=weekly"),
        expect.any(Object),
      );
    });

    it("未認証の場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      await expect(getDashboardStats()).rejects.toThrow("認証が必要です");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("APIがエラーを返した場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getDashboardStats()).rejects.toThrow(
        "ダッシュボードデータの取得に失敗しました",
      );
    });

    it("fetchがエラーをスローした場合、エラーを再スローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(getDashboardStats()).rejects.toThrow("Network error");
      consoleSpy.mockRestore();
    });
  });

  describe("getUserAnalytics", () => {
    const mockAdminUser = { id: 1, email: "admin@example.com", name: "Admin" };
    const mockAnalytics = { total: 1000, new_users: 50 };

    it("認証済みの場合、ユーザー分析データを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      const result = await getUserAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/analytics/users?period=30d",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt-token",
          }),
        }),
      );
    });

    it("期間パラメータを指定できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      await getUserAnalytics("7d");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/analytics/users?period=7d",
        expect.any(Object),
      );
    });

    it("未認証の場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      await expect(getUserAnalytics()).rejects.toThrow("認証が必要です");
    });

    it("APIがエラーを返した場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getUserAnalytics()).rejects.toThrow(
        "ユーザー分析データの取得に失敗しました",
      );
    });
  });
});
