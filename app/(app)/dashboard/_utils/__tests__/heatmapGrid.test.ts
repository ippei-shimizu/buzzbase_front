import type { ActivityLog } from "@app/types/activity";
import { weekdayNumber } from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import {
  buildHeatmapColumns,
  columnIndexOf,
  describeActivity,
  describeActivityCell,
  formatJaDate,
  indexLogsByDate,
} from "../heatmapGrid";

// 2026-08-03 は月曜。以降の期待値はこの曜日を基準にしている。
const MONDAY = "2026-08-03";

const log = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
  activity_date: MONDAY,
  intensity_level: 2,
  has_game: false,
  total_swing_count: 0,
  practice_menu_count: 0,
  ...overrides,
});

const datesOf = (from: string, to: string): string[] =>
  buildHeatmapColumns(from, to)
    .flatMap((column) => column.cells)
    .map((cell) => cell.date)
    .filter((date): date is string => date !== null);

describe("buildHeatmapColumns", () => {
  it("週ごとの列に分け、各列を 7 マスにする", () => {
    const columns = buildHeatmapColumns(MONDAY, "2026-08-16");

    expect(columns).toHaveLength(2);
    columns.forEach((column) => expect(column.cells).toHaveLength(7));
    expect(columns[0].cells[0].date).toBe(MONDAY);
    expect(columns[1].cells[0].date).toBe("2026-08-10");
    expect(columns[1].cells[6].date).toBe("2026-08-16");
  });

  it("行は月曜から日曜の順に並ぶ", () => {
    const columns = buildHeatmapColumns(MONDAY, "2026-08-09");

    columns[0].cells.forEach((cell, rowIndex) => {
      expect(weekdayNumber(cell.date as string)).toBe(rowIndex + 1);
    });
  });

  it("週の途中から始まる期間は、先頭の余りをパディングにする", () => {
    // 2026-08-05 は水曜なので、その列の月曜・火曜は範囲外。
    const columns = buildHeatmapColumns("2026-08-05", "2026-08-09");

    expect(columns[0].cells.map((cell) => cell.date)).toEqual([
      null,
      null,
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
  });

  it("週の途中で終わる期間は、末尾の余りをパディングにする", () => {
    // 2026-08-06 は木曜。金土日はまだ来ていないので範囲外。
    const columns = buildHeatmapColumns(MONDAY, "2026-08-06");

    expect(columns[0].cells.map((cell) => cell.date)).toEqual([
      MONDAY,
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      null,
      null,
      null,
    ]);
  });

  it("期間の日付を 1 日も欠かさず並べる", () => {
    const dates = datesOf("2026-08-05", "2026-08-16");

    expect(dates).toHaveLength(12);
    expect(dates[0]).toBe("2026-08-05");
    expect(dates[dates.length - 1]).toBe("2026-08-16");
  });

  it("to が from より前なら列を作らない", () => {
    expect(buildHeatmapColumns("2026-08-10", "2026-08-03")).toEqual([]);
  });

  describe("月ラベル", () => {
    it("月が変わった最初の列にだけ出す", () => {
      // 2026-06-29(月) 〜 2026-08-16(日)。列の先頭は 6/29, 7/6, 7/13, 7/20, 7/27, 8/3, 8/10。
      const labels = buildHeatmapColumns("2026-06-29", "2026-08-16").map(
        (column) => column.monthLabel,
      );

      expect(labels).toEqual(["6月", "7月", "", "", "", "8月", ""]);
    });

    it("列の途中で月が変わる場合は、その月が先頭に来る次の列へラベルを送る", () => {
      // 2026-08-01(土) は 7/27 始まりの列に含まれるが、ラベルは 8/3 の列に出す。
      const columns = buildHeatmapColumns("2026-07-27", "2026-08-09");

      expect(columns[0].monthLabel).toBe("7月");
      expect(columns[1].monthLabel).toBe("8月");
    });

    it("パディングだけの列にはラベルを出さない", () => {
      const columns = buildHeatmapColumns("2026-08-05", "2026-08-09");

      expect(columns[0].monthLabel).toBe("8月");
    });
  });

  describe("うるう年", () => {
    it("2024 年は 2 月 29 日を含める", () => {
      const dates = datesOf("2024-02-26", "2024-03-03");

      expect(dates).toContain("2024-02-29");
      expect(dates).toContain("2024-03-01");
      expect(dates).toHaveLength(7);
    });

    it("平年は 2 月 28 日の翌日が 3 月 1 日になる", () => {
      const dates = datesOf("2025-02-24", "2025-03-02");

      expect(dates).not.toContain("2025-02-29");
      expect(dates[dates.indexOf("2025-02-28") + 1]).toBe("2025-03-01");
    });

    it("年をまたぐ期間でも日付が連続する", () => {
      const dates = datesOf("2025-12-29", "2026-01-04");

      expect(dates[dates.indexOf("2025-12-31") + 1]).toBe("2026-01-01");
      expect(dates).toHaveLength(7);
    });
  });
});

describe("columnIndexOf", () => {
  const columns = buildHeatmapColumns(MONDAY, "2026-08-23");

  it("その日を含む列の index を返す", () => {
    // 2026-08-16 は日曜なので 8/10 始まりの列、8/17 は次の列。
    expect(columnIndexOf(columns, "2026-08-16")).toBe(1);
    expect(columnIndexOf(columns, "2026-08-17")).toBe(2);
  });

  it("範囲外の日は最後の列を指す", () => {
    expect(columnIndexOf(columns, "2026-09-30")).toBe(columns.length - 1);
  });
});

describe("formatJaDate", () => {
  it("年月日と曜日を返す", () => {
    expect(formatJaDate("2026-07-04")).toBe("2026年7月4日(土)");
    expect(formatJaDate(MONDAY)).toBe("2026年8月3日(月)");
    expect(formatJaDate("2026-08-09")).toBe("2026年8月9日(日)");
  });
});

describe("describeActivity", () => {
  it("記録が無い日は未記録と伝える", () => {
    expect(describeActivity(null)).toBe("未記録");
  });

  it("メニュー・素振り・試合を並べる", () => {
    expect(
      describeActivity(
        log({ practice_menu_count: 3, total_swing_count: 120, has_game: true }),
      ),
    ).toBe("メニュー3種 / 素振り120本 / 試合");
  });

  it("0 件の項目は並べない", () => {
    expect(
      describeActivity(log({ practice_menu_count: 0, total_swing_count: 50 })),
    ).toBe("素振り50本");
  });

  it("文字列で返ってきた件数も数値として扱う", () => {
    expect(
      describeActivity(
        log({ practice_menu_count: "2", total_swing_count: "80" }),
      ),
    ).toBe("メニュー2種 / 素振り80本");
  });

  it("内訳が無いログは記録ありとして扱う", () => {
    expect(describeActivity(log({ intensity_level: 1 }))).toBe("記録あり");
  });
});

describe("describeActivityCell", () => {
  it("日付と内容と活動量の言葉を含める", () => {
    const caption = describeActivityCell(
      "2026-07-04",
      log({ intensity_level: 3, practice_menu_count: 3, has_game: true }),
    );

    expect(caption).toBe(
      "2026年7月4日(土) ・ メニュー3種 / 試合 ・ 活動量多め",
    );
  });

  it("未記録の日は日付と未記録だけを伝える", () => {
    expect(describeActivityCell("2026-07-04", null)).toBe(
      "2026年7月4日(土) ・ 未記録",
    );
  });

  it("段階ごとに違う言葉を添える", () => {
    const captions = [1, 2, 3, 4].map((level) =>
      describeActivityCell(MONDAY, log({ intensity_level: level })),
    );

    expect(captions.map((caption) => caption.split(" ・ ")[2])).toEqual([
      "活動量少なめ",
      "活動量ふつう",
      "活動量多め",
      "活動量たっぷり",
    ]);
  });
});

describe("indexLogsByDate", () => {
  it("日付から引けるようにする", () => {
    const logs = [log({ activity_date: "2026-08-01" }), log()];

    expect(indexLogsByDate(logs).get(MONDAY)).toBe(logs[1]);
    expect(indexLogsByDate(logs).get("2026-08-02")).toBeUndefined();
  });
});
