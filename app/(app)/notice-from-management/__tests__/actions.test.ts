/**
 * notice-from-management server actions のリグレッションテスト
 * Next.js 15 / React 19 バージョンアップ前のベースライン
 */

// RAILS_API_URL をモック
jest.mock("../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

// next/server をモック
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

import { getPublishedNotices, getPublishedNotice } from "../actions";

describe("notice-from-management server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getPublishedNotices", () => {
    const mockNotices = [
      {
        id: 1,
        title: "お知らせ1",
        body: "内容1",
        published_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        title: "お知らせ2",
        body: "内容2",
        published_at: "2024-01-02T00:00:00Z",
      },
    ];

    it("公開済みお知らせ一覧を取得する", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ management_notices: mockNotices }),
      });

      const result = await getPublishedNotices();

      expect(result).toEqual(mockNotices);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/management_notices",
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("management_noticesがない場合、空配列を返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await getPublishedNotices();

      expect(result).toEqual([]);
    });

    it("APIがエラーを返した場合、空配列を返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getPublishedNotices();

      expect(result).toEqual([]);
    });

    it("fetchがエラーをスローした場合、空配列を返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getPublishedNotices();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("getPublishedNotice", () => {
    const mockNotice = {
      id: 1,
      title: "お知らせ1",
      body: "内容1",
      published_at: "2024-01-01T00:00:00Z",
    };

    it("指定したIDのお知らせを取得する", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ management_notice: mockNotice }),
      });

      const result = await getPublishedNotice(1);

      expect(result).toEqual(mockNotice);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://back:3000/api/v1/management_notices/1",
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("management_noticeがない場合、nullを返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await getPublishedNotice(1);

      expect(result).toBeNull();
    });

    it("APIがエラーを返した場合、nullを返す", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getPublishedNotice(1);

      expect(result).toBeNull();
    });

    it("fetchがエラーをスローした場合、nullを返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getPublishedNotice(1);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
