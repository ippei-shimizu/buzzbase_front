import {
  formatPracticeDate,
  practiceDayOfMonth,
  practiceWeekday,
} from "../_utils/practiceRecordDate";

describe("formatPracticeDate", () => {
  it("練習日を「7月14日(火)」形式で返す", () => {
    expect(formatPracticeDate("2026-07-14")).toBe("7月14日(火)");
  });

  it("月末・月初でも日付がずれない", () => {
    expect(formatPracticeDate("2026-08-01")).toBe("8月1日(土)");
    expect(formatPracticeDate("2026-12-31")).toBe("12月31日(木)");
  });

  it("時刻付きで返ってきても日付部分だけを見る", () => {
    expect(formatPracticeDate("2026-07-14T23:30:00+09:00")).toBe("7月14日(火)");
  });
});

describe("一覧のタイムライン表記", () => {
  it("日と曜日を分けて返す", () => {
    expect(practiceDayOfMonth("2026-07-14")).toBe(14);
    expect(practiceWeekday("2026-07-14")).toBe("火");
  });
});
