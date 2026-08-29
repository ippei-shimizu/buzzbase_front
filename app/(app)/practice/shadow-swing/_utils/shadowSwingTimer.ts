/**
 * 素振りカウンターの時間計算。UI・ブラウザ API から独立した純粋関数だけを置く。
 *
 * `setInterval` で「発火した回数」を足し込む方式は採らない。ブラウザは非アクティブタブの
 * タイマーを 1 秒以上まで間引くため、発火回数を数えると実時間より本数が少なくなり、
 * さらに 1 回あたりの遅延が積み上がってドリフトする。
 * ここでは常に「開始からの経過時間 ÷ インターバル」で本数を導出するため、
 * フレームが何回落ちても本数は実時間とずれない。
 */

/**
 * 実行時間の計測状態。一時停止をまたいで累計するため、
 * 「停止までに積んだ時間」と「現在の実行区間の開始時刻」を分けて持つ。
 */
export interface TimerClock {
  /** 直前までに実行した累計時間（ms）。一時停止していた時間は含まない。 */
  accumulatedMs: number;
  /** 現在の実行区間の開始時刻（`performance.now()` 相当の ms）。停止中は null。 */
  startedAt: number | null;
}

export const INITIAL_CLOCK: TimerClock = { accumulatedMs: 0, startedAt: null };

/**
 * 現在時刻における実行済み時間（ms）を返す。
 * 停止中は累計値をそのまま返すので、停止中に時間が進むことはない。
 */
export function elapsedMsAt(clock: TimerClock, now: number): number {
  if (clock.startedAt === null) return Math.max(0, clock.accumulatedMs);
  return Math.max(0, clock.accumulatedMs + (now - clock.startedAt));
}

/** 計測を開始・再開する。既に動いている場合は開始時刻を上書きしない（時間の巻き戻り防止）。 */
export function startClock(clock: TimerClock, now: number): TimerClock {
  if (clock.startedAt !== null) return clock;
  return { accumulatedMs: clock.accumulatedMs, startedAt: now };
}

/** 計測を一時停止する。停止した瞬間までの時間を累計へ畳み込む。 */
export function pauseClock(clock: TimerClock, now: number): TimerClock {
  if (clock.startedAt === null) return clock;
  return { accumulatedMs: elapsedMsAt(clock, now), startedAt: null };
}

/**
 * 経過時間から「何本目まで振り終えたか」を返す。
 * 1 本目はインターバル 1 つ分が経過した時点でカウントする（開始直後は 0 本）。
 * 不正な入力（負の経過時間・0 以下のインターバル）は 0 本として扱う。
 */
export function swingCountAtElapsed(
  elapsedMs: number,
  intervalMs: number,
): number {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(intervalMs)) return 0;
  if (intervalMs <= 0 || elapsedMs <= 0) return 0;
  return Math.floor(elapsedMs / intervalMs);
}

/** カウント画面の表示に必要な値をまとめたもの。 */
export interface TimerSnapshot {
  /** 実行済み時間（ms）。目標到達後は到達時点で頭打ちにする。 */
  elapsedMs: number;
  /** 現在の本数。目標本数を超えない。 */
  count: number;
  /** 現在のインターバル内の進捗（0〜1）。円形タイマーの針の位置。 */
  sweep: number;
  /** 目標本数に到達したか。 */
  isCompleted: boolean;
}

/**
 * 経過時間から表示状態を導出する。
 *
 * タブ復帰時などで一気に時間が飛んでも、本数・針は「その時刻における正しい値」に落ち着く。
 * 目標到達より先の時間は切り捨てるため、復帰直後に目標を超えた本数が表示されることはない。
 *
 * @param elapsedMs 実行済み時間（ms）
 * @param intervalMs 1 本あたりのインターバル（ms）
 * @param targetCount 目標本数。0 以下なら上限なしとして扱う
 */
export function timerSnapshot(
  elapsedMs: number,
  intervalMs: number,
  targetCount: number,
): TimerSnapshot {
  const safeElapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const rawCount = swingCountAtElapsed(safeElapsed, intervalMs);
  const isCompleted = targetCount > 0 && rawCount >= targetCount;

  if (isCompleted) {
    return {
      elapsedMs: targetCount * intervalMs,
      count: targetCount,
      sweep: 1,
      isCompleted: true,
    };
  }

  return {
    elapsedMs: safeElapsed,
    count: rawCount,
    sweep: intervalMs > 0 ? (safeElapsed % intervalMs) / intervalMs : 0,
    isCompleted: false,
  };
}

/**
 * 直前のフレームからの本数の変化に対して鳴らすべき合図（読み上げる本数）を返す。
 * 増えていなければ null。
 *
 * タブ復帰などで一度に複数本進んだ場合も 1 回だけ鳴らす。飛んだ本数ぶん連打すると
 * 読み上げのキューが詰まり、実際の本数から遅れた数字を読み上げ続けてしまう。
 */
export function cueForCountChange(
  previousCount: number,
  nextCount: number,
): number | null {
  return nextCount > previousCount ? nextCount : null;
}

/** 実行時間を "mm:ss" に整形する。60 分を超えても分は繰り上げずに桁を増やす。 */
export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
