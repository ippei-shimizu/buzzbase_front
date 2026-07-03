import {
  buildMonthOptions,
  UNSET_MONTH_OPTION,
} from "@app/utils/buildMonthOptions";

describe("buildMonthOptions", () => {
  const RealDate = Date;

  beforeAll(() => {
    // 当月を 2026-07 に固定して、当年は当月までしか出さない挙動を検証する。
    const fixedNow = new RealDate("2026-07-15T00:00:00+09:00");
    global.Date = class extends RealDate {
      constructor(...args: ConstructorParameters<typeof RealDate>) {
        if (args.length === 0) {
          super(fixedNow.getTime());
          return;
        }
        super(...args);
      }
    } as DateConstructor;
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  it("先頭に「指定なし」（非空のセンチネル key）を含む", () => {
    const options = buildMonthOptions([2026]);
    expect(options[0]).toEqual(UNSET_MONTH_OPTION);
    expect(options[0].key).toBe("none");
  });

  it("当年は当月までしか生成しない（未来月を出さない）", () => {
    const keys = buildMonthOptions([2026]).map((option) => option.key);
    expect(keys).toContain("2026-07");
    expect(keys).not.toContain("2026-08");
    expect(keys).not.toContain("2026-12");
  });

  it("過年度は 1〜12 月すべてを新しい順で生成する", () => {
    const keys = buildMonthOptions([2025]).map((option) => option.key);
    // 先頭「指定なし」の直後が最新月（2026-07）で、2025 は 12→1 の降順で並ぶ
    expect(keys).toContain("2025-12");
    expect(keys).toContain("2025-01");
    expect(keys.indexOf("2025-12")).toBeLessThan(keys.indexOf("2025-01"));
  });

  it("YYYY-MM 形式でゼロ埋めした key とラベルを返す", () => {
    const january = buildMonthOptions([2025]).find(
      (option) => option.key === "2025-01",
    );
    expect(january).toEqual({ key: "2025-01", label: "2025年1月" });
  });

  it("years 未指定時は当年から6年分にフォールバックする", () => {
    const keys = buildMonthOptions().map((option) => option.key);
    expect(keys).toContain("2026-07");
    expect(keys).toContain("2021-01");
    expect(keys).not.toContain("2020-12");
  });
});
