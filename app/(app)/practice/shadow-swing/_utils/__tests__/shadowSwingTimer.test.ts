import {
  INITIAL_CLOCK,
  cueForCountChange,
  elapsedMsAt,
  formatElapsed,
  pauseClock,
  startClock,
  swingCountAtElapsed,
  timerSnapshot,
} from "../shadowSwingTimer";

describe("swingCountAtElapsed", () => {
  it("インターバル1つ分が経過して初めて1本目になる", () => {
    expect(swingCountAtElapsed(0, 5000)).toBe(0);
    expect(swingCountAtElapsed(4999, 5000)).toBe(0);
    expect(swingCountAtElapsed(5000, 5000)).toBe(1);
  });

  it("境界のちょうど手前・ちょうど・直後で本数が1本ずつ進む", () => {
    expect(swingCountAtElapsed(9999, 5000)).toBe(1);
    expect(swingCountAtElapsed(10000, 5000)).toBe(2);
    expect(swingCountAtElapsed(10001, 5000)).toBe(2);
  });

  it("小数のインターバル（1.5秒）でも取りこぼさない", () => {
    expect(swingCountAtElapsed(1499, 1500)).toBe(0);
    expect(swingCountAtElapsed(1500, 1500)).toBe(1);
    expect(swingCountAtElapsed(15000, 1500)).toBe(10);
  });

  it("フレームが落ちて経過時間が飛んでも、実時間ぶんの本数になる（ドリフトしない）", () => {
    // 5 秒間隔で 100 秒ぶん時間が飛んでも 20 本。刻んだ回数を数える実装だと少なくなる。
    expect(swingCountAtElapsed(100_000, 5000)).toBe(20);
  });

  it("不正な入力は0本として扱う", () => {
    expect(swingCountAtElapsed(-1, 5000)).toBe(0);
    expect(swingCountAtElapsed(5000, 0)).toBe(0);
    expect(swingCountAtElapsed(5000, -5000)).toBe(0);
    expect(swingCountAtElapsed(Number.NaN, 5000)).toBe(0);
  });
});

describe("timerSnapshot", () => {
  it("インターバル内の進捗を0〜1で返す", () => {
    expect(timerSnapshot(0, 4000, 100).sweep).toBe(0);
    expect(timerSnapshot(2000, 4000, 100).sweep).toBe(0.5);
    expect(timerSnapshot(3999, 4000, 100).sweep).toBeCloseTo(0.99975);
    // 1 周し切った瞬間は次の周の先頭に戻る。
    expect(timerSnapshot(4000, 4000, 100).sweep).toBe(0);
  });

  it("目標本数に到達したら完了として本数・針・経過時間を頭打ちにする", () => {
    const snapshot = timerSnapshot(10_000, 5000, 2);
    expect(snapshot).toEqual({
      elapsedMs: 10_000,
      count: 2,
      sweep: 1,
      isCompleted: true,
    });
  });

  it("タブ復帰などで目標を大きく超えた時間が渡っても、目標本数を超えて表示しない", () => {
    // 目標 10 本（50 秒）に対し 5 分ぶん時間が飛んだ状態。
    const snapshot = timerSnapshot(300_000, 5000, 10);
    expect(snapshot.count).toBe(10);
    expect(snapshot.elapsedMs).toBe(50_000);
    expect(snapshot.isCompleted).toBe(true);
  });

  it("目標本数が0以下なら完了扱いにしない", () => {
    expect(timerSnapshot(30_000, 5000, 0).isCompleted).toBe(false);
    expect(timerSnapshot(30_000, 5000, 0).count).toBe(6);
  });
});

describe("TimerClock", () => {
  it("停止中は時間が進まない", () => {
    const paused = pauseClock(startClock(INITIAL_CLOCK, 1000), 6000);
    expect(elapsedMsAt(paused, 6000)).toBe(5000);
    // 停止したまま 1 分放置しても増えない。
    expect(elapsedMsAt(paused, 66_000)).toBe(5000);
  });

  it("再開すると停止前の時間から続く（停止していた時間は含めない）", () => {
    const paused = pauseClock(startClock(INITIAL_CLOCK, 1000), 6000);
    const resumed = startClock(paused, 100_000);
    expect(elapsedMsAt(resumed, 103_000)).toBe(8000);
  });

  it("実行中に再度 startClock しても開始時刻を巻き戻さない", () => {
    const running = startClock(INITIAL_CLOCK, 1000);
    expect(startClock(running, 50_000)).toBe(running);
    expect(elapsedMsAt(running, 6000)).toBe(5000);
  });

  it("停止中に pauseClock しても累計が変わらない", () => {
    const paused = pauseClock(startClock(INITIAL_CLOCK, 0), 3000);
    expect(pauseClock(paused, 90_000)).toBe(paused);
  });

  it("タブが隠れて戻ってきても、隠れていた時間ぶん本数が飛ばない", () => {
    const intervalMs = 5000;
    // 12 秒カウント（2 本）した時点で非表示になり停止。
    const hidden = pauseClock(startClock(INITIAL_CLOCK, 0), 12_000);
    expect(swingCountAtElapsed(elapsedMsAt(hidden, 12_000), intervalMs)).toBe(
      2,
    );

    // 10 分後に戻って再開。復帰直後は 2 本のままで、そこから積み上がる。
    const resumed = startClock(hidden, 612_000);
    expect(swingCountAtElapsed(elapsedMsAt(resumed, 612_000), intervalMs)).toBe(
      2,
    );
    expect(swingCountAtElapsed(elapsedMsAt(resumed, 615_000), intervalMs)).toBe(
      3,
    );
  });
});

describe("cueForCountChange", () => {
  it("本数が増えたときだけ、増えた先の本数を返す", () => {
    expect(cueForCountChange(0, 1)).toBe(1);
    expect(cueForCountChange(5, 5)).toBeNull();
    expect(cueForCountChange(5, 4)).toBeNull();
  });

  it("一度に複数本進んでも1回ぶんだけ返す（連打しない）", () => {
    expect(cueForCountChange(3, 9)).toBe(9);
  });
});

describe("formatElapsed", () => {
  it("mm:ss に整形する", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(59_999)).toBe("00:59");
    expect(formatElapsed(60_000)).toBe("01:00");
    expect(formatElapsed(3_723_000)).toBe("62:03");
  });
});
