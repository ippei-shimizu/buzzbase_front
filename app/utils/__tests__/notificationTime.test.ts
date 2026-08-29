import { formatNotificationTime } from "../notificationTime";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const NOW = new Date("2024-03-10T12:00:00+09:00");

/** NOW から ms ミリ秒だけ過去の日時を相対時刻に変換する */
const agoBy = (ms: number) =>
  formatNotificationTime(new Date(NOW.getTime() - ms).toISOString(), NOW);

// 日付表示の検証はローカルタイムゾーンに依存する。TZ は jest.config.js で Asia/Tokyo に固定している
describe("formatNotificationTime", () => {
  describe("たった今", () => {
    it("同時刻は「たった今」", () => {
      expect(agoBy(0)).toBe("たった今");
    });

    it("59秒前は「たった今」", () => {
      expect(agoBy(59 * SECOND)).toBe("たった今");
    });

    it("未来の日時でも「たった今」", () => {
      expect(agoBy(-10 * MINUTE)).toBe("たった今");
    });
  });

  describe("分", () => {
    it("60秒前は「1分前」", () => {
      expect(agoBy(60 * SECOND)).toBe("1分前");
    });

    it("59分59秒前は「59分前」", () => {
      expect(agoBy(59 * MINUTE + 59 * SECOND)).toBe("59分前");
    });
  });

  describe("時間", () => {
    it("60分前は「1時間前」", () => {
      expect(agoBy(60 * MINUTE)).toBe("1時間前");
    });

    it("23時間59分前は「23時間前」", () => {
      expect(agoBy(23 * HOUR + 59 * MINUTE)).toBe("23時間前");
    });
  });

  describe("日", () => {
    it("24時間前は「1日前」", () => {
      expect(agoBy(24 * HOUR)).toBe("1日前");
    });

    it("6日23時間59分前は「6日前」", () => {
      expect(agoBy(6 * DAY + 23 * HOUR + 59 * MINUTE)).toBe("6日前");
    });
  });

  describe("日付表示", () => {
    it("7日前ちょうどから日付表示に切り替わる", () => {
      expect(agoBy(7 * DAY)).toBe("2024/03/03");
    });

    it("月日は2桁ゼロ埋めする", () => {
      expect(formatNotificationTime("2024-01-05T10:00:00+09:00", NOW)).toBe(
        "2024/01/05",
      );
    });

    it("ローカルタイムゾーンの暦日で表示する", () => {
      // UTC では 2024/02/29、Asia/Tokyo では 2024/03/01 になる時刻
      expect(formatNotificationTime("2024-02-29T15:30:00Z", NOW)).toBe(
        "2024/03/01",
      );
    });

    it("タイムゾーンオフセット付きの表記と UTC 表記で同じ結果になる", () => {
      expect(formatNotificationTime("2024-03-01T00:30:00+09:00", NOW)).toBe(
        formatNotificationTime("2024-02-29T15:30:00Z", NOW),
      );
    });
  });

  it("日時として解釈できない値は空文字を返す", () => {
    expect(formatNotificationTime("", NOW)).toBe("");
  });
});
