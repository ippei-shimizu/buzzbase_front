const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import {
  createBaseballNote,
  deleteBaseballNote,
  getBaseballNote,
  getBaseballNotes,
  updateBaseballNote,
} from "../baseballNoteService";

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

function requestedUrl(callIndex = 0): string {
  return (global.fetch as jest.Mock).mock.calls[callIndex][0] as string;
}

function requestedInit(callIndex = 0): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[callIndex][1] as RequestInit;
}

/** 実際に送信された `baseball_note` ペイロード（キーの有無まで検証するため生 JSON から復元する）。 */
function sentNotePayload(callIndex = 0): Record<string, unknown> {
  const body = JSON.parse(requestedInit(callIndex).body as string) as {
    baseball_note: Record<string, unknown>;
  };
  return body.baseball_note;
}

function mockJsonResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const note: BaseballNoteV2 = {
  id: 1,
  title: "気づき",
  date: "2026-08-01",
  memo: '[{"type":"paragraph","children":[{"text":"外角が詰まる"}]}]',
  memo_preview: "外角が詰まる",
  game_result_ids: [11, 12],
  practice_log_id: null,
  practice_session_id: 5,
  improvement_theme_ids: [21],
  reflection_template_id: null,
  reflection_answers: [],
  tags: [{ id: 31, name: "打撃", is_preset: true }],
  media_attachments: [],
};

describe("v2 野球ノート Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("getBaseballNotes", () => {
    it("v2 の一覧エンドポイントを叩き、レスポンスをそのまま返す", async () => {
      mockJsonResponse([note]);

      const result = await getBaseballNotes();

      expect(result).toEqual({ status: "ok", data: [note] });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/baseball_notes");
      expect(requestedInit()).toEqual(
        expect.objectContaining({
          cache: "no-store",
          headers: expect.objectContaining({
            "access-token": "test-access-token",
            client: "test-client",
            uid: "test-uid",
          }),
        }),
      );
    });

    it("絞り込みを back のパラメータ名で送る", async () => {
      mockJsonResponse([]);

      await getBaseballNotes({
        date: "2026-08-01",
        practiceLogId: 3,
        practiceSessionId: 4,
        gameResultId: 5,
        improvementThemeId: 6,
      });

      const url = new URL(requestedUrl());
      expect(url.pathname).toBe("/api/v2/baseball_notes");
      expect(Object.fromEntries(url.searchParams)).toEqual({
        date: "2026-08-01",
        practice_log_id: "3",
        practice_session_id: "4",
        game_result_id: "5",
        improvement_theme_id: "6",
      });
    });

    it("未指定の絞り込みはクエリに含めない", async () => {
      mockJsonResponse([]);

      await getBaseballNotes({ gameResultId: 5 });

      const url = new URL(requestedUrl());
      expect(Object.fromEntries(url.searchParams)).toEqual({
        game_result_id: "5",
      });
    });

    it("0件は ok（空配列）として返す", async () => {
      mockJsonResponse([]);

      await expect(getBaseballNotes()).resolves.toEqual({
        status: "ok",
        data: [],
      });
    });

    it("403 は forbidden を返す（0件と区別する）", async () => {
      mockJsonResponse({ error: "権限がありません" }, 403);

      await expect(getBaseballNotes()).resolves.toEqual({
        status: "forbidden",
      });
    });

    it("その他の失敗ステータスは error を返す", async () => {
      mockJsonResponse({}, 500);

      await expect(getBaseballNotes()).resolves.toEqual({ status: "error" });
    });

    it("通信例外は error を返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

      await expect(getBaseballNotes()).resolves.toEqual({ status: "error" });
    });

    it("未認証は error を返し、リクエストを送らない", async () => {
      mockGet.mockReturnValue(undefined);

      await expect(getBaseballNotes()).resolves.toEqual({ status: "error" });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("getBaseballNote", () => {
    it("詳細エンドポイントを叩く", async () => {
      mockJsonResponse(note);

      await expect(getBaseballNote(1)).resolves.toEqual({
        status: "ok",
        data: note,
      });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/baseball_notes/1");
    });

    it("403 は forbidden、404 は error を返す", async () => {
      mockJsonResponse({}, 403);
      await expect(getBaseballNote(1)).resolves.toEqual({
        status: "forbidden",
      });

      mockJsonResponse({}, 404);
      await expect(getBaseballNote(1)).resolves.toEqual({ status: "error" });
    });
  });

  describe("createBaseballNote", () => {
    it("POST で baseball_note をラップして送る", async () => {
      mockJsonResponse(note, 201);

      const result = await createBaseballNote({
        date: "2026-08-01",
        memo: '[{"type":"paragraph","children":[{"text":"a"}]}]',
        title: "気づき",
      });

      expect(result).toEqual({ ok: true, data: note });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/baseball_notes");
      expect(requestedInit().method).toBe("POST");
      expect(sentNotePayload()).toEqual({
        date: "2026-08-01",
        memo: '[{"type":"paragraph","children":[{"text":"a"}]}]',
        title: "気づき",
      });
    });

    it("422 のバリデーションエラーメッセージを返す", async () => {
      mockJsonResponse({ errors: ["日付を入力してください"] }, 422);

      await expect(createBaseballNote({ date: "", memo: "" })).resolves.toEqual(
        {
          ok: false,
          errors: ["日付を入力してください"],
        },
      );
    });

    it("403 の Pro 制限メッセージ（error キー）を返す", async () => {
      mockJsonResponse(
        { error: "複数の試合記録への紐付けは Pro プラン限定です" },
        403,
      );

      await expect(
        createBaseballNote({
          date: "2026-08-01",
          memo: "x",
          game_result_ids: [1, 2],
        }),
      ).resolves.toEqual({
        ok: false,
        errors: ["複数の試合記録への紐付けは Pro プラン限定です"],
      });
    });

    it("未認証はリクエストを送らずエラーを返す", async () => {
      mockGet.mockReturnValue(undefined);

      await expect(
        createBaseballNote({ date: "2026-08-01", memo: "x" }),
      ).resolves.toEqual({ ok: false, errors: ["ログインが必要です"] });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("updateBaseballNote（部分更新セマンティクス）", () => {
    it("PATCH で対象ノートのエンドポイントを叩く", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, { title: "更新後" });

      expect(requestedUrl()).toBe("http://back:3000/api/v2/baseball_notes/1");
      expect(requestedInit().method).toBe("PATCH");
    });

    it("渡していない紐付けキーは送らない（back の未送信＝変更なしで既存の紐付けを保つ）", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, { title: "更新後", date: "2026-08-02" });

      const payload = sentNotePayload();
      expect(payload).toEqual({ title: "更新後", date: "2026-08-02" });
      expect(payload).not.toHaveProperty("game_result_ids");
      expect(payload).not.toHaveProperty("improvement_theme_ids");
      expect(payload).not.toHaveProperty("tag_ids");
    });

    it("undefined を渡したキーも送らない（既定値で補完しない）", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, {
        title: "更新後",
        game_result_ids: undefined,
        improvement_theme_ids: undefined,
        tag_ids: undefined,
      });

      expect(sentNotePayload()).toEqual({ title: "更新後" });
    });

    it("空配列は全解除として明示的に送る（未送信に丸めない）", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, {
        game_result_ids: [],
        improvement_theme_ids: [],
        tag_ids: [],
      });

      const payload = sentNotePayload();
      expect(payload).toEqual({
        game_result_ids: [],
        improvement_theme_ids: [],
        tag_ids: [],
      });
      expect(Object.keys(payload)).toHaveLength(3);
    });

    it("null は送る（タイトルを消す操作は未送信と区別する）", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, { title: null });

      const payload = sentNotePayload();
      expect(payload).toEqual({ title: null });
      expect(Object.keys(payload)).toContain("title");
    });

    it("紐付けキーを渡したときだけその値を送る", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, { game_result_ids: [7, 8] });

      expect(sentNotePayload()).toEqual({ game_result_ids: [7, 8] });
    });

    it("空オブジェクトのときは baseball_note も空で送る（キーを生やさない）", async () => {
      mockJsonResponse(note);

      await updateBaseballNote(1, {});

      expect(sentNotePayload()).toEqual({});
    });

    it("403 の Pro 制限メッセージを返す", async () => {
      mockJsonResponse({ error: "タグ機能は Pro プラン限定です" }, 403);

      await expect(updateBaseballNote(1, { tag_ids: [1] })).resolves.toEqual({
        ok: false,
        errors: ["タグ機能は Pro プラン限定です"],
      });
    });

    it("通信例外は失敗として返す", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

      await expect(updateBaseballNote(1, { title: "x" })).resolves.toEqual({
        ok: false,
        errors: ["ノートの更新に失敗しました"],
      });
    });
  });

  describe("deleteBaseballNote", () => {
    it("DELETE で対象ノートのエンドポイントを叩く", async () => {
      mockJsonResponse({ message: "削除しました" });

      await expect(deleteBaseballNote(9)).resolves.toEqual({
        ok: true,
        data: null,
      });
      expect(requestedUrl()).toBe("http://back:3000/api/v2/baseball_notes/9");
      expect(requestedInit().method).toBe("DELETE");
    });

    it("失敗時はエラーメッセージを返す", async () => {
      mockJsonResponse({}, 500);

      await expect(deleteBaseballNote(9)).resolves.toEqual({
        ok: false,
        errors: ["ノートの削除に失敗しました"],
      });
    });
  });
});
