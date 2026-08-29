import { recentPracticeDateLabel } from "../recentPracticeDate";

const TODAY = "2026-08-03";

describe("recentPracticeDateLabel の相対表記", () => {
  it("当日は「今日」", () => {
    expect(recentPracticeDateLabel("2026-08-03", TODAY).main).toBe("今日");
  });

  it("1日前は「昨日」", () => {
    expect(recentPracticeDateLabel("2026-08-02", TODAY).main).toBe("昨日");
  });

  it("2日前は「一昨日」", () => {
    expect(recentPracticeDateLabel("2026-08-01", TODAY).main).toBe("一昨日");
  });

  it("3日前からは月日表記に切り替わる", () => {
    expect(recentPracticeDateLabel("2026-07-31", TODAY).main).toBe("7/31");
  });

  it("月日はゼロ埋めせずに出す", () => {
    expect(recentPracticeDateLabel("2026-05-12", TODAY).main).toBe("5/12");
  });

  it("未来の日付は「今日」と名乗らせず月日で出す", () => {
    expect(recentPracticeDateLabel("2026-08-04", TODAY).main).toBe("8/4");
  });

  it("月をまたぐ「昨日」「一昨日」も月初でずれない", () => {
    expect(recentPracticeDateLabel("2026-07-31", "2026-08-01").main).toBe(
      "昨日",
    );
    expect(recentPracticeDateLabel("2026-07-30", "2026-08-01").main).toBe(
      "一昨日",
    );
  });
});

describe("recentPracticeDateLabel の曜日", () => {
  it("曜日は日付から決まる", () => {
    expect(recentPracticeDateLabel("2026-08-03", TODAY).weekday).toBe("月");
    expect(recentPracticeDateLabel("2026-08-08", TODAY).weekday).toBe("土");
    expect(recentPracticeDateLabel("2026-08-09", TODAY).weekday).toBe("日");
  });
});

describe("基準日のタイムゾーン", () => {
  // Vercel の実行環境は UTC。UTC の日付で判定すると日本時間の午前中に記録した練習が
  // 「昨日」に見えるため、既定の基準日は Asia/Tokyo の今日でなければならない。
  it("基準日を省略すると Asia/Tokyo の今日を使う", () => {
    jest.useFakeTimers();
    // UTC では 8/2、Asia/Tokyo では 8/3。
    jest.setSystemTime(new Date("2026-08-02T16:30:00Z"));

    try {
      expect(recentPracticeDateLabel("2026-08-03").main).toBe("今日");
      expect(recentPracticeDateLabel("2026-08-02").main).toBe("昨日");
    } finally {
      jest.useRealTimers();
    }
  });
});
