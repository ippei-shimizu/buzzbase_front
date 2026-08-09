jest.mock("@app/utils/media/mediaProcessing", () => ({
  processImage: jest.fn(),
  readVideoMeta: jest.fn(),
  captureVideoThumbnail: jest.fn(),
}));

jest.mock("@app/utils/media/videoResize", () => ({
  isVideoResizeSupported: jest.fn(),
  resizeVideoToLongEdge: jest.fn(),
}));

import {
  captureVideoThumbnail,
  processImage,
  readVideoMeta,
} from "@app/utils/media/mediaProcessing";
import { prepareMediaFile } from "@app/utils/media/prepareMedia";
import {
  isVideoResizeSupported,
  resizeVideoToLongEdge,
} from "@app/utils/media/videoResize";

const mockProcessImage = processImage as jest.MockedFunction<
  typeof processImage
>;
const mockReadVideoMeta = readVideoMeta as jest.MockedFunction<
  typeof readVideoMeta
>;
const mockCaptureThumbnail = captureVideoThumbnail as jest.MockedFunction<
  typeof captureVideoThumbnail
>;
const mockIsVideoResizeSupported =
  isVideoResizeSupported as jest.MockedFunction<typeof isVideoResizeSupported>;
const mockResizeVideoToLongEdge = resizeVideoToLongEdge as jest.MockedFunction<
  typeof resizeVideoToLongEdge
>;

function imageFile(type = "image/jpeg", size = 1) {
  return new File(["x".repeat(size)], "swing.jpg", { type });
}

function videoFile() {
  return new File(["x"], "swing.mp4", { type: "video/mp4" });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockProcessImage.mockResolvedValue({
    blob: new Blob(["small"], { type: "image/jpeg" }),
    contentType: "image/jpeg",
    width: 1080,
    height: 720,
  });
  mockReadVideoMeta.mockResolvedValue({
    durationSeconds: 20,
    width: 480,
    height: 270,
  });
  mockCaptureThumbnail.mockResolvedValue(
    new Blob(["t"], { type: "image/jpeg" }),
  );
  // 大半のテストは「WebCodecs非対応（選択時点で弾く）」を前提にしている。
  // リサイズ経路を検証するテストだけ個別に true を設定する。
  mockIsVideoResizeSupported.mockReturnValue(false);
});

describe("prepareMediaFile", () => {
  it("back が受け付けない形式は選択の時点で弾く", async () => {
    const result = await prepareMediaFile(imageFile("image/webp"), false);

    expect(result).toMatchObject({ ok: false });
    expect(mockProcessImage).not.toHaveBeenCalled();
  });

  it("画像は縮小して JPEG として送る", async () => {
    const result = await prepareMediaFile(imageFile(), false);

    expect(result).toMatchObject({
      ok: true,
      prepared: { mediaType: "image", contentType: "image/jpeg" },
    });
  });

  it("縮小できない形式（HEIC など）は元ファイルのまま送る", async () => {
    mockProcessImage.mockRejectedValue(new Error("decode failed"));
    const file = imageFile("image/heic");

    const result = await prepareMediaFile(file, false);

    expect(result).toMatchObject({
      ok: true,
      prepared: { contentType: "image/heic", file },
    });
  });

  it("縮小しても無料の上限を超える画像は弾く", async () => {
    mockProcessImage.mockResolvedValue({
      blob: new Blob(["x".repeat(6 * 1024 * 1024)], { type: "image/jpeg" }),
      contentType: "image/jpeg",
      width: 1080,
      height: 720,
    });

    const result = await prepareMediaFile(imageFile(), false);

    expect(result).toMatchObject({ ok: false });
  });

  it("動画のメタ情報とサムネイルを添えて送る", async () => {
    const result = await prepareMediaFile(videoFile(), false);

    expect(result).toMatchObject({
      ok: true,
      prepared: {
        mediaType: "video",
        contentType: "video/mp4",
        durationSeconds: 20,
        width: 480,
        height: 270,
      },
    });
  });

  it("上限を超える動画はサムネイル生成前に弾く", async () => {
    mockReadVideoMeta.mockResolvedValue({
      durationSeconds: 45,
      width: 480,
      height: 270,
    });

    const result = await prepareMediaFile(videoFile(), false);

    expect(result).toMatchObject({ ok: false });
    expect(mockCaptureThumbnail).not.toHaveBeenCalled();
  });

  it("Pro なら無料では超過する動画も通す", async () => {
    mockReadVideoMeta.mockResolvedValue({
      durationSeconds: 120,
      width: 1280,
      height: 720,
    });

    expect(await prepareMediaFile(videoFile(), true)).toMatchObject({
      ok: true,
    });
    expect(await prepareMediaFile(videoFile(), false)).toMatchObject({
      ok: false,
    });
  });

  it("サムネイル生成に失敗しても選択自体は成立させる", async () => {
    mockCaptureThumbnail.mockResolvedValue(null);

    const result = await prepareMediaFile(videoFile(), false);

    expect(result).toMatchObject({ ok: true, prepared: { thumbnail: null } });
  });

  it("動画のメタ情報を読めなければ弾く", async () => {
    mockReadVideoMeta.mockRejectedValue(new Error("decode failed"));

    expect(await prepareMediaFile(videoFile(), false)).toMatchObject({
      ok: false,
    });
  });

  describe("WebCodecs 対応ブラウザでの自動リサイズ", () => {
    it("解像度超過のみなら自動でリサイズしてから通す", async () => {
      mockReadVideoMeta.mockResolvedValue({
        durationSeconds: 20,
        width: 1920,
        height: 1080,
      });
      mockIsVideoResizeSupported.mockReturnValue(true);
      const resizedFile = new Blob(["resized"], { type: "video/mp4" });
      mockResizeVideoToLongEdge.mockResolvedValue({
        file: resizedFile,
        contentType: "video/mp4",
        meta: { durationSeconds: 20, width: 480, height: 270 },
      });

      const result = await prepareMediaFile(videoFile(), false);

      expect(mockResizeVideoToLongEdge).toHaveBeenCalledWith(
        expect.anything(),
        { durationSeconds: 20, width: 1920, height: 1080 },
        480,
        { signal: undefined },
      );
      expect(result).toMatchObject({
        ok: true,
        prepared: {
          file: resizedFile,
          contentType: "video/mp4",
          durationSeconds: 20,
          width: 480,
          height: 270,
        },
      });
    });

    it("呼び出し元の signal をリサイズへそのまま橋渡しする（圧縮中のキャンセルを効かせるため）", async () => {
      mockReadVideoMeta.mockResolvedValue({
        durationSeconds: 20,
        width: 1920,
        height: 1080,
      });
      mockIsVideoResizeSupported.mockReturnValue(true);
      mockResizeVideoToLongEdge.mockResolvedValue({
        file: new Blob(["resized"], { type: "video/mp4" }),
        contentType: "video/mp4",
        meta: { durationSeconds: 20, width: 480, height: 270 },
      });
      const controller = new AbortController();

      await prepareMediaFile(videoFile(), false, { signal: controller.signal });

      expect(mockResizeVideoToLongEdge).toHaveBeenCalledWith(
        expect.anything(),
        { durationSeconds: 20, width: 1920, height: 1080 },
        480,
        { signal: controller.signal },
      );
    });

    it("長さも超過している場合はリサイズを試みず弾く", async () => {
      mockReadVideoMeta.mockResolvedValue({
        durationSeconds: 45,
        width: 1920,
        height: 1080,
      });
      mockIsVideoResizeSupported.mockReturnValue(true);

      const result = await prepareMediaFile(videoFile(), false);

      expect(mockResizeVideoToLongEdge).not.toHaveBeenCalled();
      expect(result).toMatchObject({ ok: false });
    });

    it("リサイズが失敗したら元のバリデーションエラーで弾く", async () => {
      mockReadVideoMeta.mockResolvedValue({
        durationSeconds: 20,
        width: 1920,
        height: 1080,
      });
      mockIsVideoResizeSupported.mockReturnValue(true);
      mockResizeVideoToLongEdge.mockRejectedValue(
        new Error("この動画は変換できません"),
      );

      const result = await prepareMediaFile(videoFile(), false);

      expect(result).toMatchObject({ ok: false });
      expect((result as { message: string }).message).toContain("480px");
    });

    it("リサイズ後もなお上限を超えていれば弾く", async () => {
      mockReadVideoMeta.mockResolvedValue({
        durationSeconds: 20,
        width: 3840,
        height: 2160,
      });
      mockIsVideoResizeSupported.mockReturnValue(true);
      mockResizeVideoToLongEdge.mockResolvedValue({
        file: new Blob(["still-too-big"], { type: "video/mp4" }),
        contentType: "video/mp4",
        // 実装バグ等でリサイズしても上限を割り込めなかった想定。
        meta: { durationSeconds: 20, width: 900, height: 506 },
      });

      const result = await prepareMediaFile(videoFile(), false);

      expect(result).toMatchObject({ ok: false });
    });
  });
});
