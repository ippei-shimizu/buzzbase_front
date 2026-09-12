import {
  EMPTY_RECORD_SEARCH,
  alignDateRange,
  collectMonths,
  formatMonthCountLabel,
  formatMonthLabel,
  groupByMonth,
  hasActiveRecordSearch,
  itemsInMonth,
  matchesDateRange,
  matchesKeyword,
  toDay,
} from "@app/utils/recordListFilter";

interface Row {
  id: number;
  date: string;
}

const dateOf = (row: Row): string => row.date;

describe("hasActiveRecordSearch", () => {
  it("何も入っていなければ false", () => {
    expect(hasActiveRecordSearch(EMPTY_RECORD_SEARCH)).toBe(false);
  });

  it("空白だけのキーワードは絞り込みとみなさない", () => {
    expect(
      hasActiveRecordSearch({ ...EMPTY_RECORD_SEARCH, keyword: "   " }),
    ).toBe(false);
  });

  it.each([
    ["キーワード", { keyword: "素振り" }],
    ["開始日", { startDate: "2026-07-01" }],
    ["終了日", { endDate: "2026-07-31" }],
  ])("%s が入っていれば true", (_label, values) => {
    expect(hasActiveRecordSearch({ ...EMPTY_RECORD_SEARCH, ...values })).toBe(
      true,
    );
  });
});

describe("matchesDateRange", () => {
  it("開始日はその日を含む", () => {
    const range = { startDate: "2026-07-14", endDate: "" };

    expect(matchesDateRange("2026-07-14", range)).toBe(true);
    expect(matchesDateRange("2026-07-13", range)).toBe(false);
  });

  it("終了日はその日を含む", () => {
    const range = { startDate: "", endDate: "2026-07-14" };

    expect(matchesDateRange("2026-07-14", range)).toBe(true);
    expect(matchesDateRange("2026-07-15", range)).toBe(false);
  });

  it("時刻付きの値でも日付だけで比較する", () => {
    expect(
      matchesDateRange("2026-07-14T23:00:00+09:00", {
        startDate: "2026-07-14",
        endDate: "2026-07-14",
      }),
    ).toBe(true);
  });
});

describe("matchesKeyword", () => {
  it("空のキーワードは常に一致とみなす", () => {
    expect(matchesKeyword(["素振り"], "  ")).toBe(true);
  });

  it("いずれかの断片に含まれれば一致する", () => {
    expect(matchesKeyword(["素振り", "外角が詰まる"], "外角")).toBe(true);
    expect(matchesKeyword(["素振り", "外角が詰まる"], "内角")).toBe(false);
  });

  it("大文字小文字は区別しない", () => {
    expect(matchesKeyword(["Long Toss"], "long")).toBe(true);
  });
});

describe("alignDateRange", () => {
  it("開始日を終了日より後にすると終了日を寄せる", () => {
    expect(
      alignDateRange(
        { keyword: "", startDate: "", endDate: "2026-07-10" },
        "startDate",
        "2026-07-20",
      ),
    ).toEqual({ keyword: "", startDate: "2026-07-20", endDate: "2026-07-20" });
  });

  it("終了日を開始日より前にすると開始日を寄せる", () => {
    expect(
      alignDateRange(
        { keyword: "", startDate: "2026-07-20", endDate: "" },
        "endDate",
        "2026-07-10",
      ),
    ).toEqual({ keyword: "", startDate: "2026-07-10", endDate: "2026-07-10" });
  });

  it("矛盾しない変更はもう片方を触らない", () => {
    expect(
      alignDateRange(
        { keyword: "", startDate: "2026-07-01", endDate: "2026-07-31" },
        "startDate",
        "2026-07-10",
      ),
    ).toEqual({
      keyword: "",
      startDate: "2026-07-10",
      endDate: "2026-07-31",
    });
  });
});

describe("月の集計", () => {
  const rows: Row[] = [
    { id: 1, date: "2026-08-10" },
    { id: 2, date: "2026-06-02" },
    { id: 3, date: "2026-08-01" },
  ];

  it("記録がある年月を新しい順に重複なく並べる", () => {
    expect(collectMonths(rows, dateOf)).toEqual(["2026-08", "2026-06"]);
  });

  it("指定した年月の記録だけを取り出す", () => {
    expect(itemsInMonth(rows, dateOf, "2026-08").map((row) => row.id)).toEqual([
      1, 3,
    ]);
  });

  it("並び順を保ったまま年月ごとにまとめる", () => {
    const sorted: Row[] = [
      { id: 1, date: "2026-08-10" },
      { id: 3, date: "2026-08-01" },
      { id: 2, date: "2026-06-02" },
    ];

    expect(
      groupByMonth(sorted, dateOf).map((group) => [
        group.month,
        group.items.map((row) => row.id),
      ]),
    ).toEqual([
      ["2026-08", [1, 3]],
      ["2026-06", [2]],
    ]);
  });

  it("年月を日本語表記にする", () => {
    expect(formatMonthLabel("2026-08")).toBe("2026年8月");
  });

  it("月ページャの見出しに件数を添える", () => {
    expect(formatMonthCountLabel("2026-07", 3)).toBe("2026年7月（3件）");
  });

  it("時刻付きの値からも日付を取り出せる", () => {
    expect(toDay("2026-07-14T10:00:00+09:00")).toBe("2026-07-14");
  });
});
