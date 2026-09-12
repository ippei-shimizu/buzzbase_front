import {
  MEDIA_ACCEPT_ATTRIBUTE,
  buildStagedLocalId,
  computeResizeTarget,
  resolveMediaKind,
} from "@app/utils/media/mediaFile";
import { buildMediaMemoLabel } from "@app/utils/media/mediaMemoLabel";

describe("resolveMediaKind", () => {
  it("back が許可する画像形式を image として扱う", () => {
    expect(resolveMediaKind("image/jpeg")).toEqual({
      mediaType: "image",
      contentType: "image/jpeg",
    });
    expect(resolveMediaKind("image/png")?.mediaType).toBe("image");
    expect(resolveMediaKind("image/heic")?.mediaType).toBe("image");
  });

  it("back が許可する動画形式を video として扱う", () => {
    expect(resolveMediaKind("video/mp4")?.mediaType).toBe("video");
    expect(resolveMediaKind("video/quicktime")?.mediaType).toBe("video");
  });

  it("パラメータ付き・大文字の MIME も正規化する", () => {
    expect(resolveMediaKind("VIDEO/MP4; codecs=avc1")).toEqual({
      mediaType: "video",
      contentType: "video/mp4",
    });
  });

  it("back が受け付けない形式は null", () => {
    expect(resolveMediaKind("image/webp")).toBeNull();
    expect(resolveMediaKind("image/gif")).toBeNull();
    expect(resolveMediaKind("application/pdf")).toBeNull();
    expect(resolveMediaKind("")).toBeNull();
  });

  it("accept 属性には対応形式だけを載せる", () => {
    expect(MEDIA_ACCEPT_ATTRIBUTE).toBe(
      "image/jpeg,image/png,image/heic,video/mp4,video/quicktime",
    );
  });
});

describe("computeResizeTarget", () => {
  it("長辺が上限以下なら縮小しない", () => {
    expect(computeResizeTarget(800, 600, 1080)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it("長辺を上限に合わせ、縦横比を保つ", () => {
    expect(computeResizeTarget(4000, 2000, 1080)).toEqual({
      width: 1080,
      height: 540,
    });
    expect(computeResizeTarget(2000, 4000, 1080)).toEqual({
      width: 540,
      height: 1080,
    });
  });

  it("サイズ不明（0）でも例外にしない", () => {
    expect(computeResizeTarget(0, 0, 1080)).toEqual({ width: 0, height: 0 });
  });
});

describe("buildStagedLocalId", () => {
  it("連続して呼んでも重複しない", () => {
    const ids = new Set(Array.from({ length: 50 }, () => buildStagedLocalId()));
    expect(ids.size).toBe(50);
  });
});

describe("buildMediaMemoLabel", () => {
  it("未記入なら記入を促す", () => {
    expect(buildMediaMemoLabel("video", null)).toBe("動画にメモを記入");
    expect(buildMediaMemoLabel("image", "   ")).toBe("画像にメモを記入");
  });

  it("記入済みなら内容を出し、長い場合は省略する", () => {
    expect(buildMediaMemoLabel("image", "始動が早い")).toBe("始動が早い");
    expect(buildMediaMemoLabel("image", "あ".repeat(20))).toBe(
      `${"あ".repeat(14)}…`,
    );
  });
});
