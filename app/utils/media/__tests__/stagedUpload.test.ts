import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";
import type { MediaUploadResult } from "@app/utils/media/uploadPipeline";
import {
  buildStagedUploadNotice,
  summarizeStagedUploads,
  toPreparedMedia,
} from "@app/utils/media/stagedUpload";

const uploaded: MediaUploadResult = {
  ok: true,
  attachment: {
    id: 1,
    media_type: "image",
    status: "ready",
    file_size_bytes: 10,
    duration_seconds: null,
    width: null,
    height: null,
    position: 0,
    memo: null,
    playback_url: null,
    thumbnail_url: null,
    created_at: "2026-08-01T00:00:00Z",
  },
};
const canceled: MediaUploadResult = { ok: false, reason: "canceled" };
const limitReached: MediaUploadResult = {
  ok: false,
  reason: "limit_reached",
  message: "今月のアップロード上限に達しています",
};
const rejected: MediaUploadResult = {
  ok: false,
  reason: "rejected",
  message: "アップロード可能な上限を超えています",
};
const technical: MediaUploadResult = {
  ok: false,
  reason: "technical",
  message: "アップロードに失敗しました",
};

describe("summarizeStagedUploads", () => {
  it("すべて成功したらロールバックしない", () => {
    const summary = summarizeStagedUploads([uploaded, uploaded]);

    expect(summary.uploaded).toBe(2);
    expect(summary.shouldRollbackNote).toBe(false);
  });

  it("技術的失敗が1件でもあればノートをロールバックする", () => {
    expect(
      summarizeStagedUploads([uploaded, technical]).shouldRollbackNote,
    ).toBe(true);
  });

  it("ユーザーが中断しただけならロールバックしない", () => {
    const summary = summarizeStagedUploads([canceled, canceled]);

    expect(summary.canceled).toBe(2);
    expect(summary.shouldRollbackNote).toBe(false);
  });

  it("無料枠超過（403）ではロールバックしない", () => {
    const summary = summarizeStagedUploads([uploaded, limitReached]);

    expect(summary.limitReached).toBe(1);
    expect(summary.shouldRollbackNote).toBe(false);
  });

  it("サーバーが内容を理由に拒否した場合もロールバックしない", () => {
    const summary = summarizeStagedUploads([rejected]);

    expect(summary.rejected).toBe(1);
    expect(summary.shouldRollbackNote).toBe(false);
  });

  it("中断と技術的失敗が混ざったら技術的失敗を優先してロールバックする", () => {
    expect(
      summarizeStagedUploads([canceled, technical]).shouldRollbackNote,
    ).toBe(true);
  });

  it("1件もアップロードしていなければロールバックしない", () => {
    expect(summarizeStagedUploads([]).shouldRollbackNote).toBe(false);
  });
});

describe("buildStagedUploadNotice", () => {
  it("中断・拒否があればノートが残っていることを添えて伝える", () => {
    const notice = buildStagedUploadNotice(
      summarizeStagedUploads([uploaded, canceled]),
    );

    expect(notice).toContain("ノートは保存済みです");
    expect(notice).toContain("1件");
  });

  it("すべて成功なら伝えることはない", () => {
    expect(
      buildStagedUploadNotice(summarizeStagedUploads([uploaded])),
    ).toBeNull();
  });
});

describe("toPreparedMedia", () => {
  it("ローカルのメモをアップロード対象に引き継ぐ", () => {
    const file = new Blob(["x"], { type: "video/mp4" });
    const thumbnail = new Blob(["t"], { type: "image/jpeg" });
    const asset: StagedMediaAsset = {
      localId: "a",
      file,
      fileName: "swing.mp4",
      mediaType: "video",
      contentType: "video/mp4",
      thumbnail,
      previewUrl: "blob:preview",
      durationSeconds: 12,
      width: 854,
      height: 480,
      memo: "テイクバック",
    };

    expect(toPreparedMedia(asset)).toEqual({
      mediaType: "video",
      contentType: "video/mp4",
      file,
      thumbnail,
      durationSeconds: 12,
      width: 854,
      height: 480,
      memo: "テイクバック",
    });
  });
});
