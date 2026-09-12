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
  getPeriodicReviews,
  markPeriodicReviewRead,
} from "../periodicReviewService";

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

function mockResponse(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function requestedUrl(): string {
  return (global.fetch as jest.Mock).mock.calls[0][0] as string;
}

function requestedInit(): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
}

const review = {
  id: 1,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read: false,
  summary: { practice_days: 5 },
};

describe("振り返りレポートの v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getPeriodicReviews", () => {
    it("GET /api/v2/periodic_reviews を叩いて一覧を返す", async () => {
      mockResponse(200, [review]);

      const result = await getPeriodicReviews();

      expect(requestedUrl()).toBe("http://back:3000/api/v2/periodic_reviews");
      expect(requestedInit().method).toBeUndefined();
      expect(result).toEqual({ status: "ok", data: [review] });
    });

    it("0 件は取得成功として空配列を返す（未加入と未生成の区別は UI 側で行う）", async () => {
      mockResponse(200, []);

      expect(await getPeriodicReviews()).toEqual({ status: "ok", data: [] });
    });

    it("取得失敗は 0 件と区別して error を返す", async () => {
      mockResponse(500, {});

      expect(await getPeriodicReviews()).toEqual({ status: "error" });
    });
  });

  describe("markPeriodicReviewRead", () => {
    it("PATCH /api/v2/periodic_reviews/:id を叩く", async () => {
      mockResponse(200, { ...review, read: true });

      const result = await markPeriodicReviewRead(7);

      expect(requestedUrl()).toBe("http://back:3000/api/v2/periodic_reviews/7");
      expect(requestedInit().method).toBe("PATCH");
      expect(result).toEqual({ ok: true, data: { ...review, read: true } });
    });

    it("対象が見つからないときはエラーを返す", async () => {
      mockResponse(404, { error: "Not Found" });

      const result = await markPeriodicReviewRead(7);

      expect(result).toEqual({
        ok: false,
        reason: "error",
        errors: ["Not Found"],
      });
    });
  });
});
