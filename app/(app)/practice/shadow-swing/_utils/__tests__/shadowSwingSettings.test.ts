import {
  DEFAULT_CUE_SETTINGS,
  DEFAULT_INTERVAL_SECONDS,
  INTERVAL_OPTIONS,
  applyCueSelection,
  canEnableVibration,
  clampIntervalToAccess,
  intervalRange,
  isIntervalAllowed,
  resolveIntervalAccess,
  resolveVibrationAvailability,
  validateTargetCount,
} from "../shadowSwingSettings";

describe("resolveIntervalAccess", () => {
  it("Pro 判定が未確定の間は pending（Pro 前提の値を使わない）", () => {
    expect(
      resolveIntervalAccess({
        isEntitlementLoading: true,
        hasCustomInterval: true,
      }),
    ).toBe("pending");
  });

  it("確定後は entitlement の有無で free / pro になる", () => {
    expect(
      resolveIntervalAccess({
        isEntitlementLoading: false,
        hasCustomInterval: false,
      }),
    ).toBe("free");
    expect(
      resolveIntervalAccess({
        isEntitlementLoading: false,
        hasCustomInterval: true,
      }),
    ).toBe("pro");
  });
});

describe("intervalRange", () => {
  it("無料は5〜8秒", () => {
    expect(intervalRange("free")).toEqual({ min: 5, max: 8 });
  });

  it("Pro は1〜20秒", () => {
    expect(intervalRange("pro")).toEqual({ min: 1, max: 20 });
  });

  it("判定未確定は無料と同じ範囲にする", () => {
    expect(intervalRange("pending")).toEqual(intervalRange("free"));
  });
});

describe("isIntervalAllowed", () => {
  it("無料ユーザーは5〜8秒の外を選べない", () => {
    expect(isIntervalAllowed(4.9, "free")).toBe(false);
    expect(isIntervalAllowed(1, "free")).toBe(false);
    expect(isIntervalAllowed(1.5, "free")).toBe(false);
    expect(isIntervalAllowed(8.1, "free")).toBe(false);
    expect(isIntervalAllowed(20, "free")).toBe(false);
  });

  it("無料ユーザーでも境界の5秒・8秒は選べる", () => {
    expect(isIntervalAllowed(5, "free")).toBe(true);
    expect(isIntervalAllowed(8, "free")).toBe(true);
  });

  it("Pro は1.0〜20秒を選べ、その外は選べない", () => {
    expect(isIntervalAllowed(1, "pro")).toBe(true);
    expect(isIntervalAllowed(1.5, "pro")).toBe(true);
    expect(isIntervalAllowed(20, "pro")).toBe(true);
    expect(isIntervalAllowed(0.9, "pro")).toBe(false);
    expect(isIntervalAllowed(20.1, "pro")).toBe(false);
  });

  it("判定未確定の間は無料と同じ範囲しか選べない", () => {
    expect(isIntervalAllowed(1, "pending")).toBe(false);
    expect(isIntervalAllowed(20, "pending")).toBe(false);
    expect(isIntervalAllowed(5, "pending")).toBe(true);
  });

  it("選択肢のうち無料で選べるのは5〜8秒の4つだけ", () => {
    const allowed = INTERVAL_OPTIONS.filter((seconds) =>
      isIntervalAllowed(seconds, "free"),
    );
    expect(allowed).toEqual([5, 6, 7, 8]);
  });

  it("既定のインターバルは無料でもそのまま開始できる", () => {
    expect(isIntervalAllowed(DEFAULT_INTERVAL_SECONDS, "free")).toBe(true);
  });
});

describe("clampIntervalToAccess", () => {
  it("Pro 判定が確定して範囲が狭まったら、無料の範囲へ引き戻す", () => {
    expect(clampIntervalToAccess(1, "free")).toBe(5);
    expect(clampIntervalToAccess(20, "free")).toBe(8);
  });

  it("範囲内の値はそのまま返す", () => {
    expect(clampIntervalToAccess(7, "free")).toBe(7);
    expect(clampIntervalToAccess(1.5, "pro")).toBe(1.5);
  });
});

describe("validateTargetCount", () => {
  it("空欄・非数・小数を弾く", () => {
    expect(validateTargetCount("").count).toBeNull();
    expect(validateTargetCount("abc").count).toBeNull();
    expect(validateTargetCount("1.5").count).toBeNull();
  });

  it("1本未満・上限超えを弾く", () => {
    expect(validateTargetCount("0").count).toBeNull();
    expect(validateTargetCount("-10").count).toBeNull();
    expect(validateTargetCount("10000").count).toBeNull();
  });

  it("有効な値は数値として返す", () => {
    expect(validateTargetCount("200")).toEqual({ count: 200, error: null });
    expect(validateTargetCount(" 1 ")).toEqual({ count: 1, error: null });
    expect(validateTargetCount("9999")).toEqual({ count: 9999, error: null });
  });
});

describe("applyCueSelection", () => {
  it("既定は笛の音のみ有効（読み上げと同時にはならない）", () => {
    expect(DEFAULT_CUE_SETTINGS).toEqual({ whistle: true, speech: false });
  });

  it("読み上げを有効にすると笛が無効になる", () => {
    expect(
      applyCueSelection({ whistle: true, speech: false }, "speech", true),
    ).toEqual({ whistle: false, speech: true });
  });

  it("笛を有効にすると読み上げが無効になる", () => {
    expect(
      applyCueSelection({ whistle: false, speech: true }, "whistle", true),
    ).toEqual({ whistle: true, speech: false });
  });

  it("どんな順番で切り替えても両方 true にならない", () => {
    let cue = DEFAULT_CUE_SETTINGS;
    for (const kind of ["speech", "whistle", "speech", "speech"] as const) {
      cue = applyCueSelection(cue, kind, true);
      expect(cue.whistle && cue.speech).toBe(false);
    }
  });

  it("無効化はもう一方に影響しない（両方なしにできる）", () => {
    expect(
      applyCueSelection({ whistle: true, speech: false }, "whistle", false),
    ).toEqual({ whistle: false, speech: false });
  });
});

describe("resolveVibrationAvailability", () => {
  it("navigator.vibrate 非対応なら Pro でも unsupported", () => {
    expect(
      resolveVibrationAvailability({
        isSupported: false,
        isEntitlementLoading: false,
        hasVibration: true,
      }),
    ).toBe("unsupported");
  });

  it("非対応の判定は Pro 判定の未確定より優先する", () => {
    expect(
      resolveVibrationAvailability({
        isSupported: false,
        isEntitlementLoading: true,
        hasVibration: true,
      }),
    ).toBe("unsupported");
  });

  it("Pro 判定が未確定の間は有効化しない", () => {
    const availability = resolveVibrationAvailability({
      isSupported: true,
      isEntitlementLoading: true,
      hasVibration: true,
    });
    expect(availability).toBe("pending");
    expect(canEnableVibration(availability)).toBe(false);
  });

  it("対応環境かつ Pro なら利用できる", () => {
    const availability = resolveVibrationAvailability({
      isSupported: true,
      isEntitlementLoading: false,
      hasVibration: true,
    });
    expect(availability).toBe("available");
    expect(canEnableVibration(availability)).toBe(true);
  });

  it("対応環境でも無料プランは locked", () => {
    const availability = resolveVibrationAvailability({
      isSupported: true,
      isEntitlementLoading: false,
      hasVibration: false,
    });
    expect(availability).toBe("locked");
    expect(canEnableVibration(availability)).toBe(false);
  });
});
