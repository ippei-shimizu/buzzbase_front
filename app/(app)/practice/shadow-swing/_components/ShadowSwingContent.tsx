"use client";

import type { SaveState } from "./ShadowSwingComplete";
import type { ShadowSwingConfig } from "../_utils/shadowSwingSettings";
import type { FetchResult } from "@app/services/v2/requests";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  completeShadowSwingSession,
  getShadowSwingStats,
  startShadowSwingSession,
} from "@app/services/v2/shadowSwingService";
import {
  subscribeToNothing,
  supportsScreenWakeLock,
  supportsVibration,
  unsupportedOnServer,
} from "../_utils/browserSupport";
import { ScreenWakeLock } from "../_utils/screenWakeLock";
import { SwingCuePlayer } from "../_utils/swingCuePlayer";
import ShadowSwingComplete from "./ShadowSwingComplete";
import { LEAVE_CONFIRM_MESSAGE, START_FAILED_MESSAGE } from "./shadowSwingCopy";
import ShadowSwingCounter from "./ShadowSwingCounter";
import ShadowSwingSetup from "./ShadowSwingSetup";

/**
 * 3 画面をルーティングではなく 1 ページ内の状態遷移で表す。
 * ページ遷移を挟むとカウント中のコンポーネントが破棄され、経過時間も音声も失われるため、
 * カウント中は同じツリーに留め続ける。
 */
type Phase =
  | { name: "setup" }
  | { name: "counting"; sessionId: number; config: ShadowSwingConfig }
  | { name: "complete"; sessionId: number | null; swingCount: number };

interface ShadowSwingContentProps {
  initialStatsResult: FetchResult<ShadowSwingStats>;
}

/**
 * 素振りカウンターの Container。
 * セッションの開始・完了 API、統計の再取得、音声／画面ロックの寿命管理を担い、
 * 表示は設定 / カウント / 完了の各コンポーネントへ委ねる。
 */
export default function ShadowSwingContent({
  initialStatsResult,
}: ShadowSwingContentProps) {
  const [phase, setPhase] = useState<Phase>({ name: "setup" });
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saving");
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [statsResult, setStatsResult] =
    useState<FetchResult<ShadowSwingStats>>(initialStatsResult);

  // 音声とロックは画面遷移をまたいで同じインスタンスを使い続ける
  // （設定画面の操作で解禁した AudioContext をカウント画面へ引き継ぐため）。
  const [player] = useState(() => new SwingCuePlayer());
  const [wakeLock] = useState(() => new ScreenWakeLock());

  // SSR では navigator を見られないため、サーバー側は「非対応」として描画し、
  // クライアントで判定し直す（属性の不一致でハイドレーションが警告になるのを避ける）。
  const isVibrationSupported = useSyncExternalStore(
    subscribeToNothing,
    supportsVibration,
    unsupportedOnServer,
  );
  const isWakeLockSupported = useSyncExternalStore(
    subscribeToNothing,
    supportsScreenWakeLock,
    unsupportedOnServer,
  );

  useEffect(() => {
    return () => {
      player.dispose();
      void wakeLock.release();
    };
  }, [player, wakeLock]);

  // 保存に失敗した本数を持ったままの離脱を確認する。リロードすると再送できなくなるため。
  useEffect(() => {
    if (saveState !== "failed") return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = LEAVE_CONFIRM_MESSAGE;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  const save = useCallback(async (sessionId: number, swingCount: number) => {
    setSaveState("saving");
    setSaveErrors([]);

    const result = await completeShadowSwingSession(sessionId, swingCount);
    if (!result.ok) {
      setSaveState("failed");
      setSaveErrors(result.errors);
      return;
    }

    setSaveState("saved");
    setStatsResult(await getShadowSwingStats());
  }, []);

  const handleStart = useCallback(
    async (config: ShadowSwingConfig) => {
      // ブラウザはユーザー操作のハンドラの中でしか音声を解禁しないため、
      // 通信を待つ前にここで AudioContext を起こす。
      void player.unlock();

      setIsStarting(true);
      setStartError(null);
      const result = await startShadowSwingSession(config.targetCount);
      setIsStarting(false);

      if (!result.ok) {
        setStartError(result.errors[0] ?? START_FAILED_MESSAGE);
        return;
      }
      setPhase({ name: "counting", sessionId: result.data.id, config });
    },
    [player],
  );

  const handleFinish = useCallback(
    (swingCount: number) => {
      if (phase.name !== "counting") return;
      const { sessionId, config } = phase;

      // 保存の成否に関わらず、カウントできた本数はまず画面へ確定させる。
      setPhase({ name: "complete", sessionId, swingCount });
      if (config.vibration) player.vibrateCompletion();

      if (swingCount <= 0) {
        // 0 本で完了させると本数 0 の練習ログが作られ、その日を「練習した日」として
        // 草・Streak に載せてしまう。保存せずセッションは未完了のままにする。
        setSaveState("skipped");
        return;
      }
      void save(sessionId, swingCount);
    },
    [phase, player, save],
  );

  const handleRetry = useCallback(() => {
    if (phase.name !== "complete" || phase.sessionId === null) return;
    void save(phase.sessionId, phase.swingCount);
  }, [phase, save]);

  const handleRestart = useCallback(() => {
    setSaveState("saving");
    setSaveErrors([]);
    setStartError(null);
    setPhase({ name: "setup" });
  }, []);

  if (phase.name === "counting") {
    return (
      <ShadowSwingCounter
        config={phase.config}
        player={player}
        wakeLock={wakeLock}
        onFinish={handleFinish}
      />
    );
  }

  if (phase.name === "complete") {
    return (
      <ShadowSwingComplete
        swingCount={phase.swingCount}
        saveState={saveState}
        saveErrors={saveErrors}
        statsResult={statsResult}
        onRetry={handleRetry}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <ShadowSwingSetup
      statsResult={statsResult}
      isStarting={isStarting}
      startError={startError}
      onStart={handleStart}
      isVibrationSupported={isVibrationSupported}
      isWakeLockSupported={isWakeLockSupported}
    />
  );
}
