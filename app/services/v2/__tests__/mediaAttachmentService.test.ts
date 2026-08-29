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

import {
  completeMediaUpload,
  deleteMediaAttachment,
  presignMediaUpload,
  updateMediaAttachmentMemo,
} from "../mediaAttachmentService";

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

const presignResponse = {
  id: 5,
  media_type: "video",
  status: "pending",
  upload_url: "https://r2.example.com/put?sig=1",
  thumbnail_upload_url: "https://r2.example.com/thumb?sig=1",
};

const attachment = {
  id: 5,
  media_type: "video",
  status: "ready",
  file_size_bytes: 1024,
  duration_seconds: 20,
  width: 854,
  height: 480,
  position: 0,
  memo: "スイング",
  playback_url: "https://cdn.example.com/5.mp4",
  thumbnail_url: "https://cdn.example.com/5_thumb.jpg",
  created_at: "2026-08-01T00:00:00Z",
};

describe("メディア添付の v2 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("presignMediaUpload", () => {
    it("署名 URL 発行のエンドポイントへ POST する", async () => {
      mockResponse(201, presignResponse);

      const result = await presignMediaUpload({
        baseball_note_id: 3,
        media_type: "video",
        content_type: "video/mp4",
      });

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/media_attachments/presign",
      );
      expect(requestedInit().method).toBe("POST");
      expect(sentBody()).toEqual({
        media_attachment: {
          baseball_note_id: 3,
          media_type: "video",
          content_type: "video/mp4",
        },
      });
      expect(result).toEqual({ ok: true, data: presignResponse });
    });

    it("月次上限超過の 403 は forbidden として返す", async () => {
      mockResponse(403, { error: "今月のアップロード上限に達しています" });

      const result = await presignMediaUpload({
        baseball_note_id: 3,
        media_type: "image",
        content_type: "image/jpeg",
      });

      expect(result).toEqual({
        ok: false,
        reason: "forbidden",
        errors: ["今月のアップロード上限に達しています"],
      });
    });

    it("認証 cookie が無ければ通信しない", async () => {
      mockGet.mockReturnValue(undefined);

      const result = await presignMediaUpload({
        baseball_note_id: 3,
        media_type: "image",
        content_type: "image/jpeg",
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
    });
  });

  describe("completeMediaUpload", () => {
    it("完了通知として file_size_bytes 付きで PATCH する", async () => {
      mockResponse(200, attachment);

      const result = await completeMediaUpload(
        5,
        {
          file_size_bytes: 1024,
          duration_seconds: 20,
          width: 854,
          height: 480,
          memo: "スイング",
        },
        3,
      );

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/media_attachments/5",
      );
      expect(requestedInit().method).toBe("PATCH");
      expect(sentBody()).toEqual({
        media_attachment: {
          file_size_bytes: 1024,
          duration_seconds: 20,
          width: 854,
          height: 480,
          memo: "スイング",
        },
      });
      expect(result).toEqual({ ok: true, data: attachment });
    });

    it("上限超過の 422 はエラーメッセージを返す", async () => {
      mockResponse(422, { errors: ["アップロード可能な上限を超えています"] });

      const result = await completeMediaUpload(5, { file_size_bytes: 99 });

      expect(result).toEqual({
        ok: false,
        reason: "error",
        errors: ["アップロード可能な上限を超えています"],
      });
    });
  });

  describe("updateMediaAttachmentMemo", () => {
    it("完了通知と区別できるよう file_size_bytes を送らない", async () => {
      mockResponse(200, attachment);

      await updateMediaAttachmentMemo(5, { memo: "始動が早い" }, 3);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/media_attachments/5",
      );
      expect(requestedInit().method).toBe("PATCH");
      expect(sentBody()).toEqual({
        media_attachment: { memo: "始動が早い" },
      });
    });
  });

  describe("deleteMediaAttachment", () => {
    it("DELETE で削除する", async () => {
      mockResponse(200, { message: "削除しました" });

      const result = await deleteMediaAttachment(5, 3);

      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/media_attachments/5",
      );
      expect(requestedInit().method).toBe("DELETE");
      expect(requestedInit().body).toBeUndefined();
      expect(result).toEqual({ ok: true, data: { message: "削除しました" } });
    });

    it("失敗時はエラーメッセージを返す", async () => {
      mockResponse(404, null);

      const result = await deleteMediaAttachment(5);

      expect(result).toMatchObject({ ok: false, reason: "error" });
    });
  });
});
