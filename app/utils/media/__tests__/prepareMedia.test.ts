jest.mock("@app/utils/media/mediaProcessing", () => ({
  processImage: jest.fn(),
  readVideoMeta: jest.fn(),
  captureVideoThumbnail: jest.fn(),
}));

import {
  captureVideoThumbnail,
  processImage,
  readVideoMeta,
} from "@app/utils/media/mediaProcessing";
import { prepareMediaFile } from "@app/utils/media/prepareMedia";

const mockProcessImage = processImage as jest.MockedFunction<
  typeof processImage
>;
const mockReadVideoMeta = readVideoMeta as jest.MockedFunction<
  typeof readVideoMeta
>;
const mockCaptureThumbnail = captureVideoThumbnail as jest.MockedFunction<
  typeof captureVideoThumbnail
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
});
