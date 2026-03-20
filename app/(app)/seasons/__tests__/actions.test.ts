/**
 * app seasons server actions のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */

// next/headers の cookies() をモック
const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

// RAILS_API_URL をモック
jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

// next/server をモック
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

import { getSeasonsServer } from "../actions";

describe("app seasons server actions", () => {
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

  describe("getSeasonsServer", () => {
    const mockSeasons = [
      { id: 1, name: "2024年シーズン" },
      { id: 2, name: "2023年シーズン" },
    ];

    it("認証済みの場合、シーズン一覧を返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeasons,
      });

      const result = await getSeasonsServer();

      expect(result).toEqual(mockSeasons);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/seasons",
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

    it("クッキーがない場合、空配列を返す", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await getSeasonsServer();

      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("APIがエラーを返した場合、空配列を返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getSeasonsServer();

      expect(result).toEqual([]);
    });

    it("fetchがエラーをスローした場合、空配列を返す", async () => {
      setupAuthCookies();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getSeasonsServer();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });
});
