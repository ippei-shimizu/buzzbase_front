/**
 * admin users server actions のリグレッションテスト
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

// next/navigation の redirect をモック
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
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
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../actions";

const mockGetAdminUser = getAdminUser as jest.MockedFunction<
  typeof getAdminUser
>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

describe("admin users server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockAdminUser = { id: 1, email: "admin@example.com", name: "Admin" };

  describe("getAdminUsers", () => {
    it("認証済みの場合、管理者ユーザー一覧を返す", async () => {
      const mockUsers = [
        { id: 1, email: "admin1@example.com", name: "Admin1" },
        { id: 2, email: "admin2@example.com", name: "Admin2" },
      ];
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ admin_users: mockUsers }),
      });

      const result = await getAdminUsers();

      expect(result).toEqual(mockUsers);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/admin_users",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt-token",
          }),
        }),
      );
    });

    it("未認証の場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      await expect(getAdminUsers()).rejects.toThrow("認証が必要です");
    });

    it("APIがエラーを返した場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getAdminUsers()).rejects.toThrow(
        "管理者ユーザーの取得に失敗しました",
      );
    });
  });

  describe("createAdminUser", () => {
    const formData = {
      name: "New Admin",
      email: "newadmin@example.com",
      password: "password123",
      password_confirmation: "password123",
    };

    it("正常に管理者ユーザーを作成できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "作成しました" }),
      });

      const result = await createAdminUser(formData);

      expect(result).toEqual({ success: true, message: "作成しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/users",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/admin_users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ admin_user: formData }),
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await createAdminUser(formData);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["メールアドレスが重複しています"] }),
      });

      const result = await createAdminUser(formData);

      expect(result).toEqual({
        success: false,
        errors: ["メールアドレスが重複しています"],
      });
    });

    it("APIがエラーフィールドなしで失敗した場合、デフォルトエラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const result = await createAdminUser(formData);

      expect(result).toEqual({
        success: false,
        errors: ["管理者ユーザーの作成に失敗しました"],
      });
    });

    it("fetchがエラーをスローした場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await createAdminUser(formData);

      expect(result).toEqual({
        success: false,
        errors: ["管理者ユーザーの作成中にエラーが発生しました"],
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateAdminUser", () => {
    const updateData = { name: "Updated Admin", email: "updated@example.com" };

    it("正常に管理者ユーザーを更新できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "更新しました" }),
      });

      const result = await updateAdminUser(1, updateData);

      expect(result).toEqual({ success: true, message: "更新しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/users",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/admin_users/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ admin_user: updateData }),
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await updateAdminUser(1, updateData);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["更新に失敗しました"] }),
      });

      const result = await updateAdminUser(1, updateData);

      expect(result).toEqual({
        success: false,
        errors: ["更新に失敗しました"],
      });
    });
  });

  describe("deleteAdminUser", () => {
    it("正常に管理者ユーザーを削除できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "削除しました" }),
      });

      const result = await deleteAdminUser(1);

      expect(result).toEqual({ success: true, message: "削除しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/users",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/admin_users/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await deleteAdminUser(1);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["削除に失敗しました"] }),
      });

      const result = await deleteAdminUser(1);

      expect(result).toEqual({
        success: false,
        errors: ["削除に失敗しました"],
      });
    });
  });
});
