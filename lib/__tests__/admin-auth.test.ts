/**
 * admin-auth.ts のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */

// next/headers の cookies() をモック
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockCookieStore = {
  get: mockGet,
  set: mockSet,
};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => mockCookieStore),
}));

// RAILS_API_URL をモック
jest.mock("../../app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

import { getAdminUser, isAdminAuthenticated } from "../admin-auth";

describe("admin-auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // global fetch をモック
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAdminUser", () => {
    const mockUser = { id: 1, email: "admin@example.com", name: "Admin" };

    it("access-token が有効な場合、ユーザーを返す", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return { value: "valid-token" };
        if (name === "admin-refresh-token") return { value: "refresh-token" };
        return undefined;
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await getAdminUser();

      expect(result).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/validate",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Cookie: "admin-access-token=valid-token",
          }),
        }),
      );
    });

    it("access-token が無効でも refresh-token でリフレッシュできる場合、ユーザーを返す", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return undefined;
        if (name === "admin-refresh-token") return { value: "valid-refresh" };
        return undefined;
      });

      // refreshAccessToken の呼び出し
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "new-access-token" }),
      });

      // validateAccessToken の呼び出し（リフレッシュ後）
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await getAdminUser();

      expect(result).toEqual(mockUser);
      // refresh API が呼ばれたことを確認
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/admin/refresh",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Cookie: "admin-refresh-token=valid-refresh",
          }),
        }),
      );
      // 新しいaccess-tokenがcookieにセットされたことを確認
      expect(mockSet).toHaveBeenCalledWith(
        "admin-access-token",
        "new-access-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 15,
          path: "/",
        }),
      );
    });

    it("access-token のバリデーションが失敗した場合、refresh を試みる", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return { value: "expired-token" };
        if (name === "admin-refresh-token") return { value: "valid-refresh" };
        return undefined;
      });

      // validateAccessToken（最初の呼び出し - 失敗）
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      // refreshAccessToken
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "new-access-token" }),
      });

      // validateAccessToken（リフレッシュ後）
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await getAdminUser();

      expect(result).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("トークンが全くない場合、null を返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getAdminUser();

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("refresh-token も無効な場合、null を返す", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return undefined;
        if (name === "admin-refresh-token") return { value: "invalid-refresh" };
        return undefined;
      });

      // refreshAccessToken が失敗
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const result = await getAdminUser();

      expect(result).toBeNull();
    });

    it("validate API が success: false を返した場合、null を返す", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return { value: "valid-token" };
        return undefined;
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      });

      const result = await getAdminUser();

      // access-token での検証失敗後、refresh-token がないので null
      expect(result).toBeNull();
    });

    it("fetch がエラーをスローした場合、null を返す", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return { value: "valid-token" };
        return undefined;
      });

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getAdminUser();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("isAdminAuthenticated", () => {
    it("ユーザーが取得できる場合、true を返す", async () => {
      mockGet.mockImplementation((name: string) => {
        if (name === "admin-access-token") return { value: "valid-token" };
        return undefined;
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 1, email: "admin@example.com", name: "Admin" },
        }),
      });

      const result = await isAdminAuthenticated();

      expect(result).toBe(true);
    });

    it("ユーザーが取得できない場合、false を返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await isAdminAuthenticated();

      expect(result).toBe(false);
    });
  });
});
