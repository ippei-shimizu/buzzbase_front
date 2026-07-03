import {
  resolveEndChange,
  resolveStartChange,
} from "@app/components/filter/PeriodRangeFilter";

describe("resolveStartChange", () => {
  it("終了が未指定なら終了を開始へ補完し単月にする（単月ワンタップ）", () => {
    expect(resolveStartChange("2026-06", undefined)).toEqual({
      startMonth: "2026-06",
      endMonth: "2026-06",
    });
  });

  it("終了が開始より前なら終了を開始へクランプする", () => {
    expect(resolveStartChange("2026-08", "2026-05")).toEqual({
      startMonth: "2026-08",
      endMonth: "2026-08",
    });
  });

  it("終了が開始以降ならそのまま複数月レンジを保つ", () => {
    expect(resolveStartChange("2026-05", "2026-07")).toEqual({
      startMonth: "2026-05",
      endMonth: "2026-07",
    });
  });

  it("開始をクリアしても終了は維持する（開放端）", () => {
    expect(resolveStartChange("", "2026-07")).toEqual({
      startMonth: undefined,
      endMonth: "2026-07",
    });
  });
});

describe("resolveEndChange", () => {
  it("開始が未指定なら補完せず「〜指定月まで」の開放端を保つ", () => {
    expect(resolveEndChange("2026-06", undefined)).toEqual({
      startMonth: undefined,
      endMonth: "2026-06",
    });
  });

  it("開始が終了より後なら開始を終了へクランプする", () => {
    expect(resolveEndChange("2026-05", "2026-08")).toEqual({
      startMonth: "2026-05",
      endMonth: "2026-05",
    });
  });

  it("開始が終了以前ならそのまま複数月レンジを保つ", () => {
    expect(resolveEndChange("2026-07", "2026-05")).toEqual({
      startMonth: "2026-05",
      endMonth: "2026-07",
    });
  });

  it("終了をクリアしても開始は維持する（開放端）", () => {
    expect(resolveEndChange("", "2026-05")).toEqual({
      startMonth: "2026-05",
      endMonth: undefined,
    });
  });
});
