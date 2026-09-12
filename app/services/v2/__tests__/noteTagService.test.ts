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

import { createNoteTag, getNoteTags } from "../noteTagService";

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

const presetTag = { id: 1, name: "打撃", is_preset: true };

describe("ノートタグの v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getNoteTags", () => {
    it("GET /api/v2/note_tags を叩いて一覧を返す", async () => {
      mockResponse(200, [presetTag]);

      const result = await getNoteTags();

      expect(requestedUrl()).toBe("http://back:3000/api/v2/note_tags");
      expect(requestedInit().method).toBeUndefined();
      expect(result).toEqual({ status: "ok", data: [presetTag] });
    });

    it("0件は取得成功として空配列を返す", async () => {
      mockResponse(200, []);

      expect(await getNoteTags()).toEqual({ status: "ok", data: [] });
    });

    it("取得失敗は 0 件と区別して error を返す", async () => {
      mockResponse(500, {});

      expect(await getNoteTags()).toEqual({ status: "error" });
    });
  });

  describe("createNoteTag", () => {
    it("POST /api/v2/note_tags に note_tag でラップして送る", async () => {
      mockResponse(201, { id: 5, name: "メンタル", is_preset: false });

      const result = await createNoteTag({ name: "メンタル" });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/note_tags");
      expect(requestedInit().method).toBe("POST");
      expect(JSON.parse(requestedInit().body as string)).toEqual({
        note_tag: { name: "メンタル" },
      });
      expect(result).toEqual({
        ok: true,
        data: { id: 5, name: "メンタル", is_preset: false },
      });
    });

    it("無料ユーザーの 403 は forbidden として理由を返す", async () => {
      mockResponse(403, { error: "タグ機能は Pro プラン限定です" });

      expect(await createNoteTag({ name: "メンタル" })).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["タグ機能は Pro プラン限定です"],
      });
    });

    it("同名の 422 はバリデーションエラーとして返す", async () => {
      mockResponse(422, { errors: ["名前はすでに存在します"] });

      expect(await createNoteTag({ name: "メンタル" })).toEqual({
        ok: false,
        reason: "error",
        errors: ["名前はすでに存在します"],
      });
    });
  });
});
