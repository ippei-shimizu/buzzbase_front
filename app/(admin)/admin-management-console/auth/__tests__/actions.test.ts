/**
 * admin auth server actions のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */

// next/headers の cookies() をモック
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockCookieStore = {
  get: mockGet,
  set: mockSet,
  delete: mockDelete,
};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

// next/navigation の redirect をモック
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// next/server をモック（NextRequest の import 用）
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

// RAILS_API_URL をモック
jest.mock("../../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

import { redirect } from "next/navigation";
import { adminLogin, adminLogout } from "../actions";

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe("admin auth server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("adminLogin", () => {
    function createFormData(email: string, password: string): FormData {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      return formData;
    }

    it("正常にログインできた場合、cookieをセットしてリダイレクトする", async () => {
      const mockResponse = {
        success: true,
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        user: { id: 1, email: "admin@example.com", name: "Admin" },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const formData = createFormData("admin@example.com", "password123");
      await adminLogin(null, formData);

      // fetch が正しいパラメータで呼ばれたか
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/sign_in",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@example.com",
            password: "password123",
          }),
        }),
      );

      // access-token cookie がセットされたか
      expect(mockSet).toHaveBeenCalledWith(
        "admin-access-token",
        "test-access-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 15,
          path: "/",
        }),
      );

      // refresh-token cookie がセットされたか
      expect(mockSet).toHaveBeenCalledWith(
        "admin-refresh-token",
        "test-refresh-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        }),
      );

      // ダッシュボードへリダイレクト
      expect(mockRedirect).toHaveBeenCalledWith(
        "/admin-management-console/dashboard",
      );
    });

    it("APIがエラーを返した場合、エラーメッセージを返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "メールアドレスまたはパスワードが正しくありません",
        }),
      });

      const formData = createFormData("wrong@example.com", "wrong");
      const result = await adminLogin(null, formData);

      expect(result).toEqual({
        error: "メールアドレスまたはパスワードが正しくありません",
      });
      expect(mockSet).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("APIがエラーを返しerrorフィールドがない場合、デフォルトメッセージを返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const formData = createFormData("wrong@example.com", "wrong");
      const result = await adminLogin(null, formData);

      expect(result).toEqual({ error: "ログインに失敗しました" });
    });

    it("レスポンスが成功だがsuccess: falseの場合、エラーメッセージを返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      });

      const formData = createFormData("admin@example.com", "password123");
      const result = await adminLogin(null, formData);

      expect(result).toEqual({ error: "ログインに失敗しました" });
    });

    it("fetchがエラーをスローした場合、エラーメッセージを返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const formData = createFormData("admin@example.com", "password123");
      const result = await adminLogin(null, formData);

      expect(result).toEqual({
        error: "ログイン処理中にエラーが発生しました",
      });
      consoleSpy.mockRestore();
    });

    it("NEXT_REDIRECTエラーは再スローされる", async () => {
      const redirectError = new Error("NEXT_REDIRECT");

      (global.fetch as jest.Mock).mockRejectedValueOnce(redirectError);

      const formData = createFormData("admin@example.com", "password123");

      await expect(adminLogin(null, formData)).rejects.toThrow("NEXT_REDIRECT");
    });
  });

  describe("adminLogout", () => {
    it("ログアウトAPI呼び出し後、cookieを削除してリダイレクトする", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await adminLogout();

      // サインアウトAPIが呼ばれたか
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/sign_out",
        expect.objectContaining({
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }),
      );

      // cookie が削除されたか
      expect(mockDelete).toHaveBeenCalledWith("admin-access-token");
      expect(mockDelete).toHaveBeenCalledWith("admin-refresh-token");

      // ログインページへリダイレクト
      expect(mockRedirect).toHaveBeenCalledWith(
        "/admin-management-console/login",
      );
    });

    it("ログアウトAPIがエラーでも、cookieは削除してリダイレクトする", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await adminLogout();

      // cookie は削除される
      expect(mockDelete).toHaveBeenCalledWith("admin-access-token");
      expect(mockDelete).toHaveBeenCalledWith("admin-refresh-token");

      // リダイレクトは実行される
      expect(mockRedirect).toHaveBeenCalledWith(
        "/admin-management-console/login",
      );

      consoleSpy.mockRestore();
    });
  });
});
