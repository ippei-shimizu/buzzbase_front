/**
 * admin app-users server actions のリグレッションテスト
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

// next/cache の revalidatePath をモック
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// next/server をモック
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

import { revalidatePath } from "next/cache";
import { getAdminUser } from "../../../../../lib/admin-auth";
import {
  getAppUsers,
  getAppUser,
  suspendUser,
  restoreUser,
  softDeleteUser,
} from "../actions";

const mockGetAdminUser = getAdminUser as jest.MockedFunction<
  typeof getAdminUser
>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

describe("admin app-users server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockAdminUser = { id: 1, email: "admin@example.com", name: "Admin" };

  describe("getAppUsers", () => {
    const mockUsersResponse = {
      users: [
        { id: 1, name: "User1", email: "user1@example.com" },
        { id: 2, name: "User2", email: "user2@example.com" },
      ],
      total: 2,
      page: 1,
      per_page: 20,
    };

    it("認証済みの場合、アプリユーザー一覧を返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsersResponse,
      });

      const result = await getAppUsers();

      expect(result).toEqual(mockUsersResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/users",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt-token",
          }),
        }),
      );
    });

    it("検索パラメータが指定された場合、クエリに反映される", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsersResponse,
      });

      await getAppUsers({ search: "test", page: "1", per_page: "10" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("search=test"),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1"),
        expect.any(Object),
      );
    });

    it("未認証の場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      await expect(getAppUsers()).rejects.toThrow("認証が必要です");
    });

    it("APIがエラーを返した場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getAppUsers()).rejects.toThrow(
        "ユーザー一覧の取得に失敗しました",
      );
    });
  });

  describe("getAppUser", () => {
    const mockUserDetail = {
      id: 1,
      name: "User1",
      email: "user1@example.com",
      status: "active",
    };

    it("認証済みの場合、アプリユーザー詳細を返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserDetail }),
      });

      const result = await getAppUser(1);

      expect(result).toEqual(mockUserDetail);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/users/1",
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("未認証の場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      await expect(getAppUser(1)).rejects.toThrow("認証が必要です");
    });

    it("APIがエラーを返した場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getAppUser(1)).rejects.toThrow(
        "ユーザー情報の取得に失敗しました",
      );
    });
  });

  describe("suspendUser", () => {
    it("正常にユーザーを停止できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "停止しました" }),
      });

      const result = await suspendUser(1, "規約違反");

      expect(result).toEqual({ success: true, message: "停止しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/app-users",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/users/1/suspend",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ reason: "規約違反" }),
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await suspendUser(1);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["停止に失敗しました"] }),
      });

      const result = await suspendUser(1);

      expect(result).toEqual({
        success: false,
        errors: ["停止に失敗しました"],
      });
    });
  });

  describe("restoreUser", () => {
    it("正常にユーザーを復帰させられる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "復帰しました" }),
      });

      const result = await restoreUser(1);

      expect(result).toEqual({ success: true, message: "復帰しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/app-users",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/users/1/restore",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await restoreUser(1);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });
  });

  describe("softDeleteUser", () => {
    it("正常にユーザーをソフトデリートできる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "削除しました" }),
      });

      const result = await softDeleteUser(1);

      expect(result).toEqual({ success: true, message: "削除しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/app-users",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/users/1/soft_delete",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await softDeleteUser(1);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["削除に失敗しました"] }),
      });

      const result = await softDeleteUser(1);

      expect(result).toEqual({
        success: false,
        errors: ["削除に失敗しました"],
      });
    });
  });
});
