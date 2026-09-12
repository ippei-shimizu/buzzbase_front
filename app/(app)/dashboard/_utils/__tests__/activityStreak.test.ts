import type { ActivityLog } from "@app/types/activity";
import {
  activeDayMilestoneText,
  isActiveOn,
  nextMilestone,
  streakNudge,
  swingMilestoneText,
} from "../activityStreak";

const TODAY = "2026-08-03";

const log = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
  activity_date: TODAY,
  intensity_level: 2,
  has_game: false,
  total_swing_count: 0,
  practice_menu_count: 0,
  ...overrides,
});

describe("isActiveOn", () => {
  it("その日に活動があれば true", () => {
    expect(isActiveOn([log()], TODAY)).toBe(true);
  });

  it("別の日の活動では true にしない", () => {
    expect(isActiveOn([log({ activity_date: "2026-08-02" })], TODAY)).toBe(
      false,
    );
  });

  it("段階 0 のログは活動として数えない", () => {
    expect(isActiveOn([log({ intensity_level: 0 })], TODAY)).toBe(false);
  });
});

describe("streakNudge", () => {
  describe("今日まだ記録していないとき", () => {
    it("最長を超えるなら自己ベスト更新として誘う", () => {
      expect(streakNudge(11, 11, false)).toBe(
        "今日記録すれば自己ベスト更新の12日連続",
      );
    });

    it("最長に並ぶだけなら自己ベスト更新とは言わない", () => {
      const nudge = streakNudge(11, 12, false);

      expect(nudge).toBe("今日記録すれば自己ベスト(12日)に並ぶ");
      expect(nudge).not.toContain("自己ベスト更新");
    });

    it("最長に届かないなら連続日数だけを伝える", () => {
      const nudge = streakNudge(3, 30, false);

      expect(nudge).toBe("今日記録すれば4日連続");
      expect(nudge).not.toContain("自己ベスト");
    });

    it("連続が途切れているときは始めようと誘う", () => {
      expect(streakNudge(0, 30, false)).toBe("今日から連続記録を始めよう");
    });
  });

  describe("今日すでに記録したとき", () => {
    it("最長と並んでいる、または超えていれば自己ベスト更新中と伝える", () => {
      expect(streakNudge(12, 12, true)).toBe("自己ベスト更新中！12日連続");
      expect(streakNudge(13, 12, true)).toBe("自己ベスト更新中！13日連続");
    });

    it("最長に届いていなければ記録済みとだけ伝える", () => {
      const nudge = streakNudge(5, 30, true);

      expect(nudge).toBe("5日連続中！今日も記録済み");
      expect(nudge).not.toContain("自己ベスト");
    });

    it("連続 0 日で記録済みという矛盾した状態では自己ベストを名乗らない", () => {
      expect(streakNudge(0, 0, true)).toBe("0日連続中！今日も記録済み");
    });
  });
});

describe("nextMilestone", () => {
  it("現在値より大きい最初の節目を返す", () => {
    expect(nextMilestone(9, [10, 30])).toBe(10);
  });

  it("ちょうど到達した節目は次の目標にしない", () => {
    expect(nextMilestone(10, [10, 30])).toBe(30);
  });

  it("すべて到達済みなら null", () => {
    expect(nextMilestone(30, [10, 30])).toBeNull();
  });
});

describe("activeDayMilestoneText", () => {
  it("節目の 1 日前は残り 1 日と伝える", () => {
    expect(activeDayMilestoneText(9)).toBe("通算10日まであと1日");
  });

  it("節目ちょうどの日は次の節目へ切り替える", () => {
    expect(activeDayMilestoneText(10)).toBe("通算30日まであと20日");
  });

  it("節目の一覧どおりに進む", () => {
    expect(activeDayMilestoneText(0)).toBe("通算10日まであと10日");
    expect(activeDayMilestoneText(30)).toBe("通算50日まであと20日");
    expect(activeDayMilestoneText(300)).toBe("通算365日まであと65日");
    expect(activeDayMilestoneText(365)).toBe("通算500日まであと135日");
  });

  it("最後の節目に到達したら出さない", () => {
    expect(activeDayMilestoneText(1000)).toBeNull();
  });
});

describe("swingMilestoneText", () => {
  it("累計が取得できていなければ出さない", () => {
    expect(swingMilestoneText(null)).toBeNull();
  });

  it("素振りの記録がまだ無ければ出さない", () => {
    expect(swingMilestoneText(0)).toBeNull();
  });

  it("桁区切りを付けて残りを伝える", () => {
    expect(swingMilestoneText(999)).toBe("素振り累計1,000本まであと1本");
    expect(swingMilestoneText(1200)).toBe("素振り累計5,000本まであと3,800本");
  });

  it("節目ちょうどの本数は次の節目へ切り替える", () => {
    expect(swingMilestoneText(1000)).toBe("素振り累計5,000本まであと4,000本");
  });

  it("最後の節目に到達したら出さない", () => {
    expect(swingMilestoneText(100_000)).toBeNull();
  });
});
