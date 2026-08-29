import {
  FREE_IMAGE_MAX_BYTES,
  FREE_VIDEO_MAX_DURATION_SECONDS,
  FREE_VIDEO_MAX_HEIGHT,
  MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH,
  PRESIGN_URL_TTL_MS,
  PRO_IMAGE_MAX_BYTES,
  PRO_VIDEO_MAX_DURATION_SECONDS,
  PRO_VIDEO_MAX_HEIGHT,
} from "@app/constants/mediaAttachment";
import {
  isExpiredUploadStatus,
  isPresignExpiring,
  mediaLimitsFor,
  validateImageSize,
  validateVideoMeta,
} from "@app/utils/media/mediaLimits";

describe("プラン別の上限値", () => {
  it("back の PlanLimits / LimitValidator と同じ値を持つ", () => {
    expect(MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH).toBe(3);
    expect(FREE_VIDEO_MAX_DURATION_SECONDS).toBe(30);
    expect(PRO_VIDEO_MAX_DURATION_SECONDS).toBe(180);
    expect(FREE_VIDEO_MAX_HEIGHT).toBe(480);
    expect(PRO_VIDEO_MAX_HEIGHT).toBe(1280);
    expect(FREE_IMAGE_MAX_BYTES).toBe(5 * 1024 * 1024);
    expect(PRO_IMAGE_MAX_BYTES).toBe(10 * 1024 * 1024);
  });

  it("Pro かどうかで上限が切り替わる", () => {
    expect(mediaLimitsFor(false)).toEqual({
      videoMaxDurationSeconds: 30,
      videoMaxHeight: 480,
      imageMaxBytes: 5 * 1024 * 1024,
    });
    expect(mediaLimitsFor(true)).toEqual({
      videoMaxDurationSeconds: 180,
      videoMaxHeight: 1280,
      imageMaxBytes: 10 * 1024 * 1024,
    });
  });
});

describe("validateImageSize", () => {
  it("無料は5MBちょうどまで通す", () => {
    expect(validateImageSize(5 * 1024 * 1024, false)).toBeNull();
  });

  it("無料で5MBを超えると弾き、Pro の上限を案内する", () => {
    const message = validateImageSize(5 * 1024 * 1024 + 1, false);
    expect(message).toContain("5MB");
    expect(message).toContain("10MB");
  });

  it("Pro は10MBまで通す", () => {
    expect(validateImageSize(10 * 1024 * 1024, true)).toBeNull();
    expect(validateImageSize(10 * 1024 * 1024 + 1, true)).toContain("10MB");
  });
});

describe("validateVideoMeta", () => {
  it("無料は30秒・長辺480pxまで通す", () => {
    expect(
      validateVideoMeta(
        { durationSeconds: 30, width: 480, height: 270 },
        false,
      ),
    ).toBeNull();
  });

  it("無料で30秒を超える動画は弾く", () => {
    const message = validateVideoMeta(
      { durationSeconds: 31, width: 480, height: 270 },
      false,
    );
    expect(message).toContain("30秒");
    expect(message).toContain("180");
  });

  it("無料で解像度が長辺480pxを超える動画は弾く", () => {
    expect(
      validateVideoMeta(
        { durationSeconds: 10, width: 1920, height: 1080 },
        false,
      ),
    ).toContain("480px");
  });

  it("横持ち動画は width が長辺になる。height だけでは480px以内でも width超過なら弾く", () => {
    expect(
      validateVideoMeta(
        { durationSeconds: 10, width: 4000, height: 1200 },
        false,
      ),
    ).toContain("480px");
  });

  it("Pro は180秒・長辺1280pxまで通し、超えたら弾く", () => {
    expect(
      validateVideoMeta(
        { durationSeconds: 180, width: 1280, height: 720 },
        true,
      ),
    ).toBeNull();
    expect(
      validateVideoMeta(
        { durationSeconds: 181, width: 1280, height: 720 },
        true,
      ),
    ).toContain("180秒");
    expect(
      validateVideoMeta(
        { durationSeconds: 10, width: 3840, height: 2160 },
        true,
      ),
    ).toContain("1280px");
  });

  it("Pro でも縦持ち動画は height が長辺になる", () => {
    expect(
      validateVideoMeta(
        { durationSeconds: 10, width: 720, height: 1280 },
        true,
      ),
    ).toBeNull();
    expect(
      validateVideoMeta(
        { durationSeconds: 10, width: 720, height: 1281 },
        true,
      ),
    ).toContain("1280px");
  });
});

describe("署名 URL の有効期限", () => {
  it("back の PUT_EXPIRES_IN（10分）と同じ", () => {
    expect(PRESIGN_URL_TTL_MS).toBe(10 * 60 * 1000);
  });

  it("発行直後は期限切れ扱いにしない", () => {
    expect(isPresignExpiring(1_000, 1_000)).toBe(false);
  });

  it("送信中に期限を跨ぎうる時間まで進んだら期限切れ扱いにする", () => {
    const issuedAt = 0;
    expect(isPresignExpiring(issuedAt, 8 * 60 * 1000)).toBe(false);
    expect(isPresignExpiring(issuedAt, 9 * 60 * 1000)).toBe(true);
    expect(isPresignExpiring(issuedAt, 11 * 60 * 1000)).toBe(true);
  });

  it("R2 の署名失効に相当するステータスだけを失効として扱う", () => {
    expect(isExpiredUploadStatus(403)).toBe(true);
    expect(isExpiredUploadStatus(401)).toBe(true);
    expect(isExpiredUploadStatus(500)).toBe(false);
    expect(isExpiredUploadStatus(404)).toBe(false);
  });
});
