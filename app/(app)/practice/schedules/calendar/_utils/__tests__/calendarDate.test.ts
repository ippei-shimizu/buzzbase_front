import {
  addDays,
  addMonths,
  daysInMonth,
  endOfMonth,
  fetchRange,
  freeCalendarWindow,
  isRangeOutsideFreeCalendarWindow,
  isSameMonth,
  isWithinFreeCalendarWindow,
  monthGridDays,
  monthGridRange,
  monthGridWeeks,
  shiftCursor,
  startOfMonth,
  startOfWeek,
  todayInTokyo,
  visibleRange,
  weekDays,
  weekdayNumber,
} from "../calendarDate";

// 2026-08-03 は月曜。この日を「今日」とすると無料枠は 2026-05-03 〜 2026-11-03 になる。
const TODAY = "2026-08-03";

describe("todayInTokyo", () => {
  it("UTC では前日でも Asia/Tokyo の日付を返す", () => {
    expect(todayInTokyo(new Date("2026-08-03T15:30:00Z"))).toBe("2026-08-04");
  });

  it("UTC の日付が変わる直前でも Asia/Tokyo の日付を返す", () => {
    expect(todayInTokyo(new Date("2026-08-03T23:59:59Z"))).toBe("2026-08-04");
  });

  it("Asia/Tokyo の日付が変わる直前は当日のまま", () => {
    expect(todayInTokyo(new Date("2026-08-03T14:59:59Z"))).toBe("2026-08-03");
  });
});

describe("addDays", () => {
  it("月をまたいで加算できる", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
  });

  it("年をまたいで減算できる", () => {
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("うるう年の2月末を正しく越える", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
  });

  it("平年の2月末を正しく越える", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("daysInMonth", () => {
  it("うるう年の2月は29日", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });

  it("平年の2月は28日", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });

  it("400で割り切れない100の倍数年は平年扱い", () => {
    expect(daysInMonth(2100, 1)).toBe(28);
    expect(daysInMonth(2000, 1)).toBe(29);
  });
});

describe("addMonths", () => {
  it("同じ日が無い月は月末に丸める", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
  });

  it("年をまたいで加減算できる", () => {
    expect(addMonths("2026-11-15", 3)).toBe("2027-02-15");
    expect(addMonths("2026-01-15", -3)).toBe("2025-10-15");
  });

  it("月末起点の3ヶ月前も丸める", () => {
    expect(addMonths("2026-05-31", -3)).toBe("2026-02-28");
  });
});

describe("weekdayNumber", () => {
  it("月曜を1、日曜を7として返す（back の days_of_week と同じ体系）", () => {
    expect(weekdayNumber("2026-07-06")).toBe(1);
    expect(weekdayNumber("2026-07-07")).toBe(2);
    expect(weekdayNumber("2026-07-11")).toBe(6);
    expect(weekdayNumber("2026-07-12")).toBe(7);
  });
});

describe("startOfWeek / weekDays", () => {
  it("日曜は同じ週の月曜まで戻る", () => {
    expect(startOfWeek("2026-07-12")).toBe("2026-07-06");
  });

  it("月曜はその日のまま", () => {
    expect(startOfWeek("2026-07-06")).toBe("2026-07-06");
  });

  it("週は月曜から日曜の7日", () => {
    expect(weekDays("2026-07-09")).toEqual([
      "2026-07-06",
      "2026-07-07",
      "2026-07-08",
      "2026-07-09",
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ]);
  });
});

describe("startOfMonth / endOfMonth", () => {
  it("月初と月末を返す", () => {
    expect(startOfMonth("2026-07-15")).toBe("2026-07-01");
    expect(endOfMonth("2026-07-15")).toBe("2026-07-31");
  });

  it("うるう年の2月末は29日", () => {
    expect(endOfMonth("2024-02-10")).toBe("2024-02-29");
  });

  it("平年の2月末は28日", () => {
    expect(endOfMonth("2026-02-10")).toBe("2026-02-28");
  });
});

describe("monthGridRange", () => {
  it("月初の曜日ぶんだけ前月へ、月末の曜日ぶんだけ翌月へはみ出す", () => {
    // 2026-07-01 は水曜、2026-07-31 は金曜。
    expect(monthGridRange("2026-07-15")).toEqual({
      from: "2026-06-29",
      to: "2026-08-02",
    });
  });

  it("月初が月曜の月は前月へはみ出さない", () => {
    // 2026-06-01 は月曜。
    expect(monthGridRange("2026-06-10").from).toBe("2026-06-01");
  });

  it("月末が日曜の月は翌月へはみ出さない", () => {
    // 2026-05-31 は日曜。
    expect(monthGridRange("2026-05-10").to).toBe("2026-05-31");
  });

  it("うるう年の2月は29日を含む", () => {
    expect(monthGridDays("2024-02-01")).toContain("2024-02-29");
  });
});

describe("monthGridDays / monthGridWeeks", () => {
  it("常に7の倍数の日数になる", () => {
    ["2026-02-01", "2026-07-01", "2024-02-01", "2026-08-01"].forEach((iso) => {
      expect(monthGridDays(iso).length % 7).toBe(0);
    });
  });

  it("先頭は必ず月曜で、日付は連続する", () => {
    const days = monthGridDays("2026-07-01");
    expect(weekdayNumber(days[0])).toBe(1);
    days.forEach((day, index) => {
      if (index === 0) return;
      expect(day).toBe(addDays(days[index - 1], 1));
    });
  });

  it("週ごとに7日ずつ区切られる", () => {
    const weeks = monthGridWeeks("2026-07-01");
    weeks.forEach((week) => expect(week).toHaveLength(7));
    expect(weeks.flat()).toEqual(monthGridDays("2026-07-01"));
  });

  it("月をまたぐ週は前月・翌月の日も含む", () => {
    const firstWeek = monthGridWeeks("2026-07-01")[0];
    expect(firstWeek).toContain("2026-06-30");
    expect(firstWeek).toContain("2026-07-01");
  });
});

describe("isSameMonth", () => {
  it("同じ年月なら true", () => {
    expect(isSameMonth("2026-07-01", "2026-07-31")).toBe(true);
    expect(isSameMonth("2026-06-30", "2026-07-01")).toBe(false);
    expect(isSameMonth("2025-07-01", "2026-07-01")).toBe(false);
  });
});

describe("freeCalendarWindow / isWithinFreeCalendarWindow", () => {
  it("今日の前後3ヶ月が閲覧範囲になる", () => {
    expect(freeCalendarWindow(TODAY)).toEqual({
      from: "2026-05-03",
      to: "2026-11-03",
    });
  });

  it("境界日は範囲内に含む", () => {
    expect(isWithinFreeCalendarWindow("2026-05-03", TODAY)).toBe(true);
    expect(isWithinFreeCalendarWindow("2026-11-03", TODAY)).toBe(true);
  });

  it("境界の1日外は範囲外", () => {
    expect(isWithinFreeCalendarWindow("2026-05-02", TODAY)).toBe(false);
    expect(isWithinFreeCalendarWindow("2026-11-04", TODAY)).toBe(false);
  });
});

describe("isRangeOutsideFreeCalendarWindow", () => {
  it("1日でも重なっていれば範囲外扱いにしない", () => {
    expect(
      isRangeOutsideFreeCalendarWindow(
        { from: "2026-11-03", to: "2026-12-06" },
        TODAY,
      ),
    ).toBe(false);
  });

  it("完全に外側なら範囲外", () => {
    expect(
      isRangeOutsideFreeCalendarWindow(
        { from: "2026-11-04", to: "2026-12-06" },
        TODAY,
      ),
    ).toBe(true);
    expect(
      isRangeOutsideFreeCalendarWindow(
        { from: "2026-03-30", to: "2026-05-02" },
        TODAY,
      ),
    ).toBe(true);
  });
});

describe("shiftCursor", () => {
  it("月モードは月初へ寄せてから1ヶ月動く", () => {
    expect(shiftCursor("month", "2026-01-31", 1)).toBe("2026-02-01");
    expect(shiftCursor("month", "2026-08-15", -1)).toBe("2026-07-01");
  });

  it("週モードは7日動く", () => {
    expect(shiftCursor("week", "2026-07-09", 1)).toBe("2026-07-16");
    expect(shiftCursor("week", "2026-07-09", -1)).toBe("2026-07-02");
  });

  it("日モードは1日動く", () => {
    expect(shiftCursor("day", "2026-07-31", 1)).toBe("2026-08-01");
    expect(shiftCursor("day", "2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("visibleRange", () => {
  it("月モードは月グリッド全体", () => {
    expect(visibleRange("month", "2026-07-15")).toEqual(
      monthGridRange("2026-07-15"),
    );
  });

  it("週モードは月曜から日曜", () => {
    expect(visibleRange("week", "2026-07-09")).toEqual({
      from: "2026-07-06",
      to: "2026-07-12",
    });
  });

  it("日モードはその日だけ", () => {
    expect(visibleRange("day", "2026-07-09")).toEqual({
      from: "2026-07-09",
      to: "2026-07-09",
    });
  });
});

describe("fetchRange", () => {
  it("モードに依らず基準日の月グリッド全体を取りに行く", () => {
    expect(fetchRange("2026-07-09")).toEqual(monthGridRange("2026-07-09"));
  });

  it("その月のどの日を含む週も取得範囲に収まる", () => {
    const range = fetchRange("2026-07-09");
    monthGridDays("2026-07-09").forEach((day) => {
      weekDays(day).forEach((weekDay) => {
        if (!isSameMonth(weekDay, "2026-07-09")) return;
        expect(weekDay >= range.from && weekDay <= range.to).toBe(true);
      });
    });
  });
});
