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
  createReflectionTemplate,
  deleteReflectionTemplate,
  getReflectionTemplates,
  updateReflectionTemplate,
} from "../reflectionTemplateService";

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

function requestedUrl(callIndex = 0): string {
  return (global.fetch as jest.Mock).mock.calls[callIndex][0] as string;
}

function requestedInit(callIndex = 0): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[callIndex][1] as RequestInit;
}

function sentBody(callIndex = 0): unknown {
  return JSON.parse(requestedInit(callIndex).body as string);
}

const template = {
  id: 1,
  title: "試合の振り返り",
  questions: ["良かった点", "次やること"],
  is_preset: false,
  is_default: false,
  sort_order: 0,
};

describe("振り返りテンプレの v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getReflectionTemplates", () => {
    it("一覧を取得する", async () => {
      mockResponse(200, [template]);

      const result = await getReflectionTemplates();

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/reflection_templates",
      );
      expect(result).toEqual({ status: "ok", data: [template] });
    });

    it("取得に失敗しても空配列に丸めず error を返す", async () => {
      mockResponse(500, {});

      expect(await getReflectionTemplates()).toEqual({ status: "error" });
    });

    it("Cookie が欠けていればリクエストしない", async () => {
      mockGet.mockReturnValue(undefined);

      expect(await getReflectionTemplates()).toEqual({ status: "error" });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("createReflectionTemplate", () => {
    it("reflection_template で包んで POST する", async () => {
      mockResponse(201, template);

      const result = await createReflectionTemplate({
        title: "試合の振り返り",
        questions: ["良かった点"],
      });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/reflection_templates",
      );
      expect(requestedInit().method).toBe("POST");
      expect(sentBody()).toEqual({
        reflection_template: {
          title: "試合の振り返り",
          questions: ["良かった点"],
        },
      });
      expect(result).toEqual({ ok: true, data: template });
    });

    it("無料枠超過の 403 は forbidden として返す", async () => {
      mockResponse(403, { error: "自作テンプレは無料プランで1つまでです" });

      expect(
        await createReflectionTemplate({ title: "t", questions: ["q"] }),
      ).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["自作テンプレは無料プランで1つまでです"],
      });
    });
  });

  describe("updateReflectionTemplate", () => {
    it("id を指定して PATCH する", async () => {
      mockResponse(200, { ...template, id: 77 });

      const result = await updateReflectionTemplate(4, {
        title: "改訂版",
        questions: ["新しい問い"],
      });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/reflection_templates/4",
      );
      expect(requestedInit().method).toBe("PATCH");
      expect(sentBody()).toEqual({
        reflection_template: { title: "改訂版", questions: ["新しい問い"] },
      });
      // back は原本を更新せず新バージョンを作るため、返るのは別 ID のレコード
      expect(result).toEqual({ ok: true, data: { ...template, id: 77 } });
    });
  });

  describe("deleteReflectionTemplate", () => {
    it("id を指定して DELETE する", async () => {
      mockResponse(200, { message: "削除しました" });

      const result = await deleteReflectionTemplate(7);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/reflection_templates/7",
      );
      expect(requestedInit().method).toBe("DELETE");
      expect(result).toEqual({ ok: true, data: { message: "削除しました" } });
    });

    it("使用中の 422 は理由をそのまま返す", async () => {
      mockResponse(422, {
        error: "このテンプレは野球ノートで使用されているため削除できません",
      });

      expect(await deleteReflectionTemplate(7)).toEqual({
        ok: false,
        reason: "error",
        errors: ["このテンプレは野球ノートで使用されているため削除できません"],
      });
    });
  });
});
