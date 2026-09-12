jest.mock("@app/services/v2/mediaAttachmentService", () => ({
  presignMediaUpload: jest.fn(),
  completeMediaUpload: jest.fn(),
}));

jest.mock("@app/utils/media/r2Upload", () => ({
  putToPresignedUrl: jest.fn(),
}));

import type { NoteMediaAttachment } from "@app/interface/mediaAttachmentV2";
import type { MutationResult } from "@app/services/v2/requests";
import type { PreparedMedia } from "@app/utils/media/uploadPipeline";
import {
  completeMediaUpload,
  presignMediaUpload,
} from "@app/services/v2/mediaAttachmentService";
import { putToPresignedUrl } from "@app/utils/media/r2Upload";
import { uploadPreparedMedia } from "@app/utils/media/uploadPipeline";

const mockPresign = presignMediaUpload as jest.MockedFunction<
  typeof presignMediaUpload
>;
const mockComplete = completeMediaUpload as jest.MockedFunction<
  typeof completeMediaUpload
>;
const mockPut = putToPresignedUrl as jest.MockedFunction<
  typeof putToPresignedUrl
>;

/** 呼び出し順を1本の配列で確認するための記録先。 */
let callOrder: string[] = [];

const attachment: NoteMediaAttachment = {
  id: 11,
  media_type: "image",
  status: "ready",
  file_size_bytes: 1234,
  duration_seconds: null,
  width: 1080,
  height: 720,
  position: 0,
  memo: null,
  playback_url: "https://cdn.example.com/1.jpg",
  thumbnail_url: null,
  created_at: "2026-08-01T00:00:00Z",
};

function presignOk(overrides: Partial<{ thumbnailUrl: string | null }> = {}) {
  return {
    ok: true as const,
    data: {
      id: 11,
      media_type: "image" as const,
      status: "pending" as const,
      upload_url: "https://r2.example.com/put?sig=1",
      thumbnail_upload_url: overrides.thumbnailUrl ?? null,
    },
  };
}

function imageMedia(): PreparedMedia {
  return {
    mediaType: "image",
    contentType: "image/jpeg",
    file: new Blob(["abcd"], { type: "image/jpeg" }),
    thumbnail: null,
    width: 1080,
    height: 720,
  };
}

function videoMedia(): PreparedMedia {
  return {
    mediaType: "video",
    contentType: "video/mp4",
    file: new Blob(["abcd"], { type: "video/mp4" }),
    thumbnail: new Blob(["t"], { type: "image/jpeg" }),
    durationSeconds: 20,
    width: 854,
    height: 480,
    memo: "スイングの軌道",
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  callOrder = [];
  mockPresign.mockImplementation(async () => {
    callOrder.push("presign");
    return presignOk();
  });
  mockPut.mockImplementation(async () => {
    callOrder.push("put");
    return { ok: true };
  });
  mockComplete.mockImplementation(async () => {
    callOrder.push("complete");
    return { ok: true, data: attachment };
  });
});

describe("uploadPreparedMedia", () => {
  it("presign → R2 へ PUT → 完了通知 の順で実行する", async () => {
    const result = await uploadPreparedMedia(imageMedia(), 7);

    expect(callOrder).toEqual(["presign", "put", "complete"]);
    expect(result).toEqual({ ok: true, attachment });
  });

  it("presign には baseball_note_id と media_type / content_type を送る", async () => {
    await uploadPreparedMedia(imageMedia(), 7);

    expect(mockPresign).toHaveBeenCalledWith({
      baseball_note_id: 7,
      media_type: "image",
      content_type: "image/jpeg",
    });
  });

  it("PUT には presign が返した URL と同じ content_type を送る", async () => {
    await uploadPreparedMedia(imageMedia(), 7);

    expect(mockPut).toHaveBeenCalledWith(
      "https://r2.example.com/put?sig=1",
      expect.any(Blob),
      "image/jpeg",
      undefined,
    );
  });

  it("完了通知には実サイズとメタ情報・メモを送る", async () => {
    mockPresign.mockResolvedValue(
      presignOk({ thumbnailUrl: "https://r2.example.com/thumb?sig=1" }),
    );

    await uploadPreparedMedia(videoMedia(), 7);

    expect(mockComplete).toHaveBeenCalledWith(
      11,
      {
        file_size_bytes: 4,
        duration_seconds: 20,
        width: 854,
        height: 480,
        memo: "スイングの軌道",
      },
      7,
    );
  });

  it("動画は本体とサムネイルの2回 PUT する", async () => {
    mockPresign.mockImplementation(async () => {
      callOrder.push("presign");
      return presignOk({ thumbnailUrl: "https://r2.example.com/thumb?sig=1" });
    });

    await uploadPreparedMedia(videoMedia(), 7);

    expect(callOrder).toEqual(["presign", "put", "put", "complete"]);
    expect(mockPut).toHaveBeenNthCalledWith(
      2,
      "https://r2.example.com/thumb?sig=1",
      expect.any(Blob),
      "image/jpeg",
      undefined,
    );
  });

  it("サムネイルの PUT に失敗しても本体は完了させる", async () => {
    mockPresign.mockResolvedValue(
      presignOk({ thumbnailUrl: "https://r2.example.com/thumb?sig=1" }),
    );
    mockPut
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, canceled: false, status: 500 });

    const result = await uploadPreparedMedia(videoMedia(), 7);

    expect(mockComplete).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
  });

  describe("失敗の分類", () => {
    it("presign が 403 なら無料枠超過として返し、PUT も完了通知もしない", async () => {
      mockPresign.mockResolvedValue({
        ok: false,
        reason: "forbidden",
        errors: ["今月のアップロード上限に達しています"],
      } as MutationResult<never>);

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(result).toEqual({
        ok: false,
        reason: "limit_reached",
        message: "今月のアップロード上限に達しています",
      });
      expect(mockPut).not.toHaveBeenCalled();
      expect(mockComplete).not.toHaveBeenCalled();
    });

    it("presign が通信エラーなら技術的失敗として返す", async () => {
      mockPresign.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["アップロードの準備に失敗しました"],
      } as MutationResult<never>);

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(result).toMatchObject({ ok: false, reason: "technical" });
      expect(mockComplete).not.toHaveBeenCalled();
    });

    it("PUT が 5xx なら技術的失敗として返し、完了通知はしない", async () => {
      mockPut.mockResolvedValue({ ok: false, canceled: false, status: 500 });

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(result).toMatchObject({ ok: false, reason: "technical" });
      expect(mockComplete).not.toHaveBeenCalled();
    });

    it("完了通知が 422 ならサーバー拒否として返す（技術的失敗にしない）", async () => {
      mockComplete.mockResolvedValue({
        ok: false,
        reason: "error",
        errors: ["アップロード可能な上限を超えています"],
      } as MutationResult<never>);

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(result).toEqual({
        ok: false,
        reason: "rejected",
        message: "アップロード可能な上限を超えています",
      });
    });

    it("ユーザーが中断したら canceled として返し、完了通知はしない", async () => {
      mockPut.mockResolvedValue({ ok: false, canceled: true });

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(result).toEqual({ ok: false, reason: "canceled" });
      expect(mockComplete).not.toHaveBeenCalled();
    });

    it("開始前に中断済みなら presign すらしない", async () => {
      const controller = new AbortController();
      controller.abort();

      const result = await uploadPreparedMedia(imageMedia(), 7, {
        signal: controller.signal,
      });

      expect(result).toEqual({ ok: false, reason: "canceled" });
      expect(mockPresign).not.toHaveBeenCalled();
    });
  });

  describe("署名 URL の期限切れ", () => {
    it("PUT が 403 で落ちたら presign を取り直して送り直す", async () => {
      mockPut
        .mockImplementationOnce(async () => {
          callOrder.push("put");
          return { ok: false, canceled: false, status: 403 };
        })
        .mockImplementationOnce(async () => {
          callOrder.push("put");
          return { ok: true };
        });

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(callOrder).toEqual([
        "presign",
        "put",
        "presign",
        "put",
        "complete",
      ]);
      expect(result.ok).toBe(true);
    });

    it("取り直しても期限切れなら技術的失敗として返す", async () => {
      mockPut.mockResolvedValue({ ok: false, canceled: false, status: 403 });

      const result = await uploadPreparedMedia(imageMedia(), 7);

      expect(mockPresign).toHaveBeenCalledTimes(2);
      expect(result).toMatchObject({ ok: false, reason: "technical" });
      expect(mockComplete).not.toHaveBeenCalled();
    });

    it("本体の送信が長引き期限が近ければ、サムネイル送信前に取り直す", async () => {
      mockPresign.mockImplementation(async () => {
        callOrder.push("presign");
        return presignOk({
          thumbnailUrl: "https://r2.example.com/thumb?sig=1",
        });
      });
      // 1回目の本体 PUT に9分かかった状況を作る。
      const timestamps = [0, 9 * 60 * 1000, 9 * 60 * 1000, 9 * 60 * 1000];
      let index = 0;
      const now = () => timestamps[Math.min(index++, timestamps.length - 1)];

      const result = await uploadPreparedMedia(videoMedia(), 7, { now });

      expect(callOrder).toEqual([
        "presign",
        "put",
        "presign",
        "put",
        "put",
        "complete",
      ]);
      expect(result.ok).toBe(true);
    });
  });

  it("フェーズをアップロード中 → 仕上げ中 → 完了の順に通知する", async () => {
    const phases: string[] = [];

    await uploadPreparedMedia(imageMedia(), 7, {
      onPhase: (phase) => phases.push(phase),
    });

    expect(phases).toEqual(["uploading", "finalizing", "done"]);
  });
});
