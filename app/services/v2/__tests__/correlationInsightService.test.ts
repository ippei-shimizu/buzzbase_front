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
  createInsightCombination,
  deleteInsightCombination,
  getCorrelationInsights,
} from "../correlationInsightService";

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

const insight = {
  key: "swings_vs_ba",
  id: null,
  title: "素振りの本数と打率",
  body: "素振りの本数が多い週ほど、打率が.045高い傾向。",
  metric: "batting_average",
  dimension: "total_swings",
  direction: "positive",
  strength: "strong",
  sample_weeks: 8,
  sufficient: true,
};

describe("練習と成績のつながりの v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getCorrelationInsights", () => {
    it("GET /api/v2/correlation_insights を叩き、insights を取り出す", async () => {
      mockResponse(200, { insights: [insight] });

      const result = await getCorrelationInsights();

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/correlation_insights",
      );
      expect(result).toEqual({ status: "ok", data: [insight] });
    });

    it("0 件は取得成功として空配列を返す", async () => {
      mockResponse(200, { insights: [] });

      expect(await getCorrelationInsights()).toEqual({
        status: "ok",
        data: [],
      });
    });

    it("Pro 未加入の 403 は forbidden として返す（取得失敗と区別する）", async () => {
      mockResponse(403, {
        error: "「練習と成績のつながり」は Pro プラン限定です",
      });

      expect(await getCorrelationInsights()).toEqual({ status: "forbidden" });
    });

    it("サーバーエラーは error として返す（0 件に丸めない）", async () => {
      mockResponse(500, {});

      expect(await getCorrelationInsights()).toEqual({ status: "error" });
    });
  });

  describe("createInsightCombination", () => {
    it("POST /api/v2/insight_combinations に insight_combination で包んで送る", async () => {
      mockResponse(201, { message: "作成しました" });

      const result = await createInsightCombination({
        input_type: "sleep_hours",
        practice_menu_id: null,
        metric: "ops",
      });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/insight_combinations",
      );
      expect(requestedInit().method).toBe("POST");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        insight_combination: {
          input_type: "sleep_hours",
          practice_menu_id: null,
          metric: "ops",
        },
      });
      expect(result).toEqual({ ok: true, data: { message: "作成しました" } });
    });

    it("Pro 限定の 403 は forbidden として返す", async () => {
      mockResponse(403, {
        error: "「練習と成績のつながり」は Pro プラン限定です",
      });

      expect(
        await createInsightCombination({
          input_type: "sleep_hours",
          metric: "ops",
        }),
      ).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["「練習と成績のつながり」は Pro プラン限定です"],
      });
    });

    it("20件上限の 422 は forbidden ではなく error として返す", async () => {
      mockResponse(422, { error: "作成できる組み合わせは上限に達しています" });

      expect(
        await createInsightCombination({
          input_type: "sleep_hours",
          metric: "ops",
        }),
      ).toEqual({
        ok: false,
        reason: "error",
        errors: ["作成できる組み合わせは上限に達しています"],
      });
    });

    it("理由が返らないときは重複と上限の両方を示唆する文言にする", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("not json");
        },
      });

      const result = await createInsightCombination({
        input_type: "sleep_hours",
        metric: "ops",
      });

      expect(result).toEqual({
        ok: false,
        reason: "error",
        errors: [
          "組み合わせを作成できませんでした。同じ組み合わせがすでにあるか、上限に達している可能性があります。",
        ],
      });
    });
  });

  describe("deleteInsightCombination", () => {
    it("DELETE /api/v2/insight_combinations/:id を叩く", async () => {
      mockResponse(200, { message: "削除しました" });

      const result = await deleteInsightCombination(7);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/insight_combinations/7",
      );
      expect(requestedInit().method).toBe("DELETE");
      expect(requestedInit().body).toBeUndefined();
      expect(result).toEqual({ ok: true, data: { message: "削除しました" } });
    });
  });
});
