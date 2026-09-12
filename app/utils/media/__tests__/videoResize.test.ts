const mockConversionInit = jest.fn();

jest.mock("mediabunny", () => ({
  ALL_FORMATS: [],
  BlobSource: jest.fn(),
  BufferTarget: jest.fn(),
  Conversion: { init: (...args: unknown[]) => mockConversionInit(...args) },
  Mp4OutputFormat: jest.fn(),
  Input: jest.fn(),
  Output: jest.fn().mockImplementation(() => ({
    target: { buffer: new ArrayBuffer(8) },
  })),
}));

jest.mock("@app/utils/media/mediaProcessing", () => ({
  readVideoMeta: jest.fn(),
}));

import { readVideoMeta } from "@app/utils/media/mediaProcessing";
import {
  isVideoResizeSupported,
  resizeVideoToLongEdge,
} from "@app/utils/media/videoResize";

const mockReadVideoMeta = readVideoMeta as jest.MockedFunction<
  typeof readVideoMeta
>;

function videoFile() {
  return new File(["x"], "swing.mp4", { type: "video/mp4" });
}

describe("isVideoResizeSupported", () => {
  const originalVideoEncoder = globalThis.VideoEncoder;
  const originalVideoDecoder = globalThis.VideoDecoder;

  afterEach(() => {
    globalThis.VideoEncoder = originalVideoEncoder;
    globalThis.VideoDecoder = originalVideoDecoder;
  });

  it("VideoEncoder/VideoDecoder が無い環境では false", () => {
    // @ts-expect-error 非対応環境を模すため VideoEncoder を意図的に消す
    delete globalThis.VideoEncoder;
    // @ts-expect-error 非対応環境を模すため VideoDecoder を意図的に消す
    delete globalThis.VideoDecoder;

    expect(isVideoResizeSupported()).toBe(false);
  });

  it("両方揃っていれば true", () => {
    // @ts-expect-error 対応環境を模すためダミーの VideoEncoder を設定する
    globalThis.VideoEncoder = class {};
    // @ts-expect-error 対応環境を模すためダミーの VideoDecoder を設定する
    globalThis.VideoDecoder = class {};

    expect(isVideoResizeSupported()).toBe(true);
  });
});

describe("resizeVideoToLongEdge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadVideoMeta.mockResolvedValue({
      durationSeconds: 20,
      width: 480,
      height: 270,
    });
  });

  it("横持ち動画は width を長辺として指定する", async () => {
    mockConversionInit.mockResolvedValue({
      isValid: true,
      execute: jest.fn().mockResolvedValue(undefined),
      cancel: jest.fn(),
    });

    await resizeVideoToLongEdge(
      videoFile(),
      { durationSeconds: 20, width: 1920, height: 1080 },
      480,
    );

    expect(mockConversionInit).toHaveBeenCalledWith(
      expect.objectContaining({ video: { width: 480 } }),
    );
  });

  it("縦持ち動画は height を長辺として指定する", async () => {
    mockConversionInit.mockResolvedValue({
      isValid: true,
      execute: jest.fn().mockResolvedValue(undefined),
    });

    await resizeVideoToLongEdge(
      videoFile(),
      { durationSeconds: 20, width: 1080, height: 1920 },
      480,
    );

    expect(mockConversionInit).toHaveBeenCalledWith(
      expect.objectContaining({ video: { height: 480 } }),
    );
  });

  it("isValid が false なら変換を実行せず例外を投げる", async () => {
    const execute = jest.fn();
    mockConversionInit.mockResolvedValue({ isValid: false, execute });

    await expect(
      resizeVideoToLongEdge(
        videoFile(),
        { durationSeconds: 20, width: 1920, height: 1080 },
        480,
      ),
    ).rejects.toThrow();
    expect(execute).not.toHaveBeenCalled();
  });

  it("成功したらリサイズ後のファイルとメタを返す", async () => {
    mockConversionInit.mockResolvedValue({
      isValid: true,
      execute: jest.fn().mockResolvedValue(undefined),
    });
    mockReadVideoMeta.mockResolvedValue({
      durationSeconds: 20,
      width: 480,
      height: 270,
    });

    const result = await resizeVideoToLongEdge(
      videoFile(),
      { durationSeconds: 20, width: 1920, height: 1080 },
      480,
    );

    expect(result.contentType).toBe("video/mp4");
    expect(result.meta).toEqual({
      durationSeconds: 20,
      width: 480,
      height: 270,
    });
  });

  it("signal が既に abort 済みなら変換を実行せず conversion.cancel() して例外を投げる", async () => {
    const execute = jest.fn();
    const cancel = jest.fn().mockResolvedValue(undefined);
    mockConversionInit.mockResolvedValue({ isValid: true, execute, cancel });
    const controller = new AbortController();
    controller.abort();

    await expect(
      resizeVideoToLongEdge(
        videoFile(),
        { durationSeconds: 20, width: 1920, height: 1080 },
        480,
        { signal: controller.signal },
      ),
    ).rejects.toThrow();

    expect(execute).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("実行中に signal が abort されたら conversion.cancel() を呼ぶ（キャンセルボタンを有効にする）", async () => {
    const cancel = jest.fn().mockResolvedValue(undefined);
    const execute = jest
      .fn()
      .mockImplementation(
        () => new Promise((_resolve, reject) => reject(new Error("canceled"))),
      );
    mockConversionInit.mockResolvedValue({ isValid: true, execute, cancel });
    const controller = new AbortController();

    const promise = resizeVideoToLongEdge(
      videoFile(),
      { durationSeconds: 20, width: 1920, height: 1080 },
      480,
      { signal: controller.signal },
    );
    controller.abort();

    // タイムアウト等の他の失敗要因と区別できるよう、signal起因のときは
    // 常に AbortError として投げる（呼び出し元がキャンセル専用メッセージを出すため）。
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("変換が既定時間内に終わらなければタイムアウトして conversion.cancel() を呼ぶ", async () => {
    jest.useFakeTimers();
    const cancel = jest.fn().mockResolvedValue(undefined);
    // 実運用の execute() は解決も拒否もせず固まるケースを模す。
    const execute = jest.fn().mockImplementation(() => new Promise(() => {}));
    mockConversionInit.mockResolvedValue({ isValid: true, execute, cancel });

    resizeVideoToLongEdge(
      videoFile(),
      { durationSeconds: 20, width: 1920, height: 1080 },
      480,
    );
    // Conversion.init は Promise なので、setTimeout 登録まで一度マイクロタスクを進める。
    await Promise.resolve();
    await Promise.resolve();

    jest.advanceTimersByTime(60_000);

    expect(cancel).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
