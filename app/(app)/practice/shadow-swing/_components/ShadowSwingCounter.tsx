"use client";

import type { ScreenWakeLock } from "../_utils/screenWakeLock";
import type { ShadowSwingConfig } from "../_utils/shadowSwingSettings";
import type { TimerClock, TimerSnapshot } from "../_utils/shadowSwingTimer";
import type { SwingCuePlayer } from "../_utils/swingCuePlayer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  INITIAL_CLOCK,
  cueForCountChange,
  elapsedMsAt,
  formatElapsed,
  pauseClock,
  startClock,
  timerSnapshot,
} from "../_utils/shadowSwingTimer";
import CircularTimer from "./CircularTimer";
import {
  AUTO_PAUSED_BY_HIDDEN,
  FINISH_BUTTON_LABEL,
  LEAVE_CONFIRM_MESSAGE,
  PAUSE_BUTTON_LABEL,
  RESUME_BUTTON_LABEL,
} from "./shadowSwingCopy";

interface ShadowSwingCounterProps {
  config: ShadowSwingConfig;
  /** 設定画面の「開始する」押下時に解禁済みのプレイヤー。 */
  player: SwingCuePlayer;
  wakeLock: ScreenWakeLock;
  /** 目標到達・手動終了のどちらでも呼ばれる。引数はカウントできた本数。 */
  onFinish: (swingCount: number) => void;
}

const INITIAL_SNAPSHOT: TimerSnapshot = {
  elapsedMs: 0,
  count: 0,
  sweep: 0,
  isCompleted: false,
};

/**
 * 素振りのカウント画面。
 *
 * 本数は `requestAnimationFrame` ごとに「開始からの経過時間」から導出する。
 * フレームが間引かれても経過時間そのものは正しいため、本数がずれない。
 * 一方でタブが非表示になると音・振動が止まり合図として成立しないので、
 * 非表示を検知した時点で計測を止め（＝時間も進めず）、復帰後は明示的な再開を求める。
 */
export default function ShadowSwingCounter({
  config,
  player,
  wakeLock,
  onFinish,
}: ShadowSwingCounterProps) {
  const intervalMs = config.intervalSeconds * 1000;
  const targetCount = config.targetCount;

  const clockRef = useRef<TimerClock>(INITIAL_CLOCK);
  const lastCountRef = useRef(0);
  const finishedRef = useRef(false);
  const isRunningRef = useRef(true);

  const [isRunning, setIsRunningState] = useState(true);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(INITIAL_SNAPSHOT);

  const setRunning = useCallback((next: boolean) => {
    isRunningRef.current = next;
    setIsRunningState(next);
  }, []);

  const finish = useCallback(
    (swingCount: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      clockRef.current = pauseClock(clockRef.current, performance.now());
      setRunning(false);
      player.stopSpeaking();
      void wakeLock.release();
      onFinish(swingCount);
    },
    [onFinish, player, setRunning, wakeLock],
  );

  const pause = useCallback(
    (isAutomatic: boolean) => {
      if (!isRunningRef.current || finishedRef.current) return;
      clockRef.current = pauseClock(clockRef.current, performance.now());
      setRunning(false);
      setIsAutoPaused(isAutomatic);
      player.stopSpeaking();
      void wakeLock.release();
    },
    [player, setRunning, wakeLock],
  );

  const resume = useCallback(() => {
    if (isRunningRef.current || finishedRef.current) return;
    // 再開もユーザー操作なので、ここで音声を解禁し直す。
    // 非表示の間に AudioContext が suspend されていると、そのままでは無音で進んでしまう。
    void player.unlock();
    clockRef.current = startClock(clockRef.current, performance.now());
    setRunning(true);
    setIsAutoPaused(false);
    void wakeLock.acquire();
  }, [player, setRunning, wakeLock]);

  // 計測開始と画面消灯の抑止。画面を離れるときに読み上げとロックを必ず後始末する。
  useEffect(() => {
    clockRef.current = startClock(clockRef.current, performance.now());
    void wakeLock.acquire();
    return () => {
      player.stopSpeaking();
      void wakeLock.release();
    };
  }, [player, wakeLock]);

  // 本数・針の更新。setInterval で刻まず、毎フレーム経過時間から導出する。
  useEffect(() => {
    if (!isRunning) return;

    let frame = 0;
    const tick = () => {
      const elapsedMs = elapsedMsAt(clockRef.current, performance.now());
      const next = timerSnapshot(elapsedMs, intervalMs, targetCount);

      const cueCount = cueForCountChange(lastCountRef.current, next.count);
      if (cueCount !== null) {
        lastCountRef.current = next.count;
        if (config.cue.whistle) player.playWhistle();
        if (config.cue.speech) player.speakCount(cueCount);
        if (config.vibration) player.vibrateSwing();
      }

      setSnapshot(next);
      if (next.isCompleted) {
        finish(next.count);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    isRunning,
    intervalMs,
    targetCount,
    config.cue.whistle,
    config.cue.speech,
    config.vibration,
    player,
    finish,
  ]);

  // タブ・ウィンドウが隠れたら自動で一時停止する。
  // ブラウザはバックグラウンドのタイマーを間引き、音声も鳴らせないため、
  // 「カウントは進むが合図は無い」状態を作らずに時間ごと止める。
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") pause(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pause]);

  // 未保存のカウントを持ったままの離脱を確認する（リロード・タブを閉じる操作向け）。
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (finishedRef.current) return;
      event.preventDefault();
      event.returnValue = LEAVE_CONFIRM_MESSAGE;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const progress =
    targetCount > 0 ? Math.min(snapshot.count / targetCount, 1) : 0;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <CircularTimer
        sweep={snapshot.sweep}
        count={snapshot.count}
        targetCount={targetCount}
        isPaused={!isRunning}
      />

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-sub"
        role="progressbar"
        aria-label="目標本数までの進捗"
        aria-valuemin={0}
        aria-valuemax={targetCount}
        aria-valuenow={snapshot.count}
      >
        <div
          className="h-full rounded-full bg-[#d08000]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="text-lg text-zinc-400 tabular-nums">
        <span className="sr-only">経過時間 </span>
        {formatElapsed(snapshot.elapsedMs)}
      </p>

      {isAutoPaused ? (
        <p role="status" className="text-center text-sm text-zinc-300">
          {AUTO_PAUSED_BY_HIDDEN}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => (isRunning ? pause(false) : resume())}
          className="rounded-lg bg-sub px-8 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
        >
          {isRunning ? PAUSE_BUTTON_LABEL : RESUME_BUTTON_LABEL}
        </button>
        <button
          type="button"
          onClick={() => finish(snapshot.count)}
          className="rounded-lg bg-[#d08000] px-8 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
        >
          {FINISH_BUTTON_LABEL}
        </button>
      </div>
    </div>
  );
}
