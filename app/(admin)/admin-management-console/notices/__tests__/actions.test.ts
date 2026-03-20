/**
 * admin notices server actions のリグレッションテスト
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
  getManagementNotices,
  createManagementNotice,
  updateManagementNotice,
  deleteManagementNotice,
} from "../actions";

const mockGetAdminUser = getAdminUser as jest.MockedFunction<
  typeof getAdminUser
>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

describe("admin notices server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockAdminUser = { id: 1, email: "admin@example.com", name: "Admin" };

  describe("getManagementNotices", () => {
    it("認証済みの場合、お知らせ一覧を返す", async () => {
      const mockNotices = [
        {
          id: 1,
          title: "お知らせ1",
          body: "内容1",
          status: "published" as const,
        },
        {
          id: 2,
          title: "お知らせ2",
          body: "内容2",
          status: "draft" as const,
        },
      ];
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ management_notices: mockNotices }),
      });

      const result = await getManagementNotices();

      expect(result).toEqual(mockNotices);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/management_notices",
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

      await expect(getManagementNotices()).rejects.toThrow("認証が必要です");
    });

    it("APIがエラーを返した場合、エラーをスローする", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getManagementNotices()).rejects.toThrow(
        "お知らせの取得に失敗しました",
      );
    });
  });

  describe("createManagementNotice", () => {
    const formData = {
      title: "新しいお知らせ",
      body: "お知らせの内容",
      status: "draft" as const,
    };

    it("正常にお知らせを作成できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "作成しました" }),
      });

      const result = await createManagementNotice(formData);

      expect(result).toEqual({ success: true, message: "作成しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/notices",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/management_notices",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ management_notice: formData }),
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await createManagementNotice(formData);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["タイトルは必須です"] }),
      });

      const result = await createManagementNotice(formData);

      expect(result).toEqual({
        success: false,
        errors: ["タイトルは必須です"],
      });
    });

    it("APIがエラーフィールドなしで失敗した場合、デフォルトエラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const result = await createManagementNotice(formData);

      expect(result).toEqual({
        success: false,
        errors: ["お知らせの作成に失敗しました"],
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

      const result = await createManagementNotice(formData);

      expect(result).toEqual({
        success: false,
        errors: ["お知らせの作成中にエラーが発生しました"],
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateManagementNotice", () => {
    const formData = {
      title: "更新されたお知らせ",
      body: "更新された内容",
      status: "published" as const,
    };

    it("正常にお知らせを更新できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "更新しました" }),
      });

      const result = await updateManagementNotice(1, formData);

      expect(result).toEqual({ success: true, message: "更新しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/notices",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/management_notices/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ management_notice: formData }),
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await updateManagementNotice(1, formData);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["更新に失敗しました"] }),
      });

      const result = await updateManagementNotice(1, formData);

      expect(result).toEqual({
        success: false,
        errors: ["更新に失敗しました"],
      });
    });
  });

  describe("deleteManagementNotice", () => {
    it("正常にお知らせを削除できる", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "削除しました" }),
      });

      const result = await deleteManagementNotice(1);

      expect(result).toEqual({ success: true, message: "削除しました" });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/admin-management-console/notices",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/management_notices/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("未認証の場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(null);

      const result = await deleteManagementNotice(1);

      expect(result).toEqual({ success: false, errors: ["認証が必要です"] });
    });

    it("APIがエラーを返した場合、エラーを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: ["削除に失敗しました"] }),
      });

      const result = await deleteManagementNotice(1);

      expect(result).toEqual({
        success: false,
        errors: ["削除に失敗しました"],
      });
    });

    it("削除成功でmessageがない場合、デフォルトメッセージを返す", async () => {
      mockGetAdminUser.mockResolvedValueOnce(mockAdminUser);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await deleteManagementNotice(1);

      expect(result).toEqual({
        success: true,
        message: "お知らせを削除しました",
      });
    });
  });
});
