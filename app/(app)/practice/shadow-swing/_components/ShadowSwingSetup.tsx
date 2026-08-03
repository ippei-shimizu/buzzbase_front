"use client";

import type {
  CueSettings,
  ShadowSwingConfig,
} from "../_utils/shadowSwingSettings";
import type { FetchResult } from "@app/services/v2/requests";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import { useState } from "react";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  DEFAULT_CUE_SETTINGS,
  DEFAULT_INTERVAL_SECONDS,
  DEFAULT_TARGET_COUNT,
  INTERVAL_OPTIONS,
  MAX_TARGET_COUNT,
  MIN_TARGET_COUNT,
  applyCueSelection,
  canEnableVibration,
  clampIntervalToAccess,
  isIntervalAllowed,
  resolveIntervalAccess,
  resolveVibrationAvailability,
  validateTargetCount,
} from "../_utils/shadowSwingSettings";
import {
  BACKGROUND_WEB_NOTICE,
  CUE_EXCLUSIVE_HINT,
  FREE_INTERVAL_HINT,
  INTERVAL_PENDING_HINT,
  PAGE_DESCRIPTION,
  START_BUTTON_LABEL,
  VIBRATION_LOCKED_HINT,
  VIBRATION_UNSUPPORTED_HINT,
  WAKE_LOCK_UNSUPPORTED_NOTICE,
} from "./shadowSwingCopy";
import ShadowSwingStatsCard from "./ShadowSwingStatsCard";

interface ShadowSwingSetupProps {
  statsResult: FetchResult<ShadowSwingStats>;
  isStarting: boolean;
  startError: string | null;
  onStart: (config: ShadowSwingConfig) => void;
  /** `navigator.vibrate` を持つ環境か。クライアントで判定した値を受け取る。 */
  isVibrationSupported: boolean;
  /** Screen Wake Lock を持つ環境か。 */
  isWakeLockSupported: boolean;
}

/** インターバルの表示ラベル。mobile と同じく小数第1位まで出して 1.5 秒刻みを読み取れるようにする。 */
function intervalLabel(seconds: number): string {
  return `${seconds.toFixed(1)}秒`;
}

const OPTION_BASE_CLASS =
  "flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main";

/**
 * 素振りカウンターの設定画面。
 * 目標本数・インターバル・合図・バイブレーションを決め、確定した設定を親へ渡す。
 * Pro 判定はここでのみ参照し、カウント画面へは解決済みの設定値だけを渡す。
 */
export default function ShadowSwingSetup({
  statsResult,
  isStarting,
  startError,
  onStart,
  isVibrationSupported,
  isWakeLockSupported,
}: ShadowSwingSetupProps) {
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET_COUNT));
  const [targetError, setTargetError] = useState<string | null>(null);
  const [intervalSeconds, setIntervalSeconds] = useState(
    DEFAULT_INTERVAL_SECONDS,
  );
  const [cue, setCue] = useState<CueSettings>(DEFAULT_CUE_SETTINGS);
  const [vibration, setVibration] = useState(false);

  const intervalAccess = resolveIntervalAccess({
    isEntitlementLoading,
    hasCustomInterval: hasEntitlement("shadow_swing_custom_interval"),
  });
  const vibrationAvailability = resolveVibrationAvailability({
    isSupported: isVibrationSupported,
    isEntitlementLoading,
    hasVibration: hasEntitlement("shadow_swing_vibration"),
  });
  const canVibrate = canEnableVibration(vibrationAvailability);

  // 判定が確定して選択範囲が狭まった場合に備え、開始時の値は必ず範囲内へ丸める。
  // 派生値なので state を持たず、レンダリング中に計算する。
  const effectiveInterval = clampIntervalToAccess(
    intervalSeconds,
    intervalAccess,
  );
  const effectiveVibration = vibration && canVibrate;

  const handleIntervalClick = (seconds: number) => {
    if (!isIntervalAllowed(seconds, intervalAccess)) {
      openProUpgradeModal({ trigger: "shadow_swing_custom_interval" });
      return;
    }
    setIntervalSeconds(seconds);
  };

  const handleVibrationClick = (next: boolean) => {
    if (next && !canVibrate) {
      // 非対応ブラウザは課金しても振動しないため、Pro 訴求ではなく理由の説明だけを出す。
      if (vibrationAvailability === "locked") {
        openProUpgradeModal({ trigger: "shadow_swing_vibration" });
      }
      return;
    }
    setVibration(next);
  };

  const handleStart = () => {
    const { count, error } = validateTargetCount(targetInput);
    setTargetError(error);
    if (count === null) return;

    onStart({
      targetCount: count,
      intervalSeconds: effectiveInterval,
      cue,
      vibration: effectiveVibration,
    });
  };

  return (
    <div className="space-y-6">
      <p className="rounded-[10px] bg-sub px-4 py-3 text-[13px] leading-5 text-zinc-300">
        {PAGE_DESCRIPTION}
      </p>

      <div>
        <label
          htmlFor="shadow-swing-target"
          className="block text-[13px] font-semibold text-zinc-400"
        >
          目標本数
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="shadow-swing-target"
            type="number"
            inputMode="numeric"
            min={MIN_TARGET_COUNT}
            max={MAX_TARGET_COUNT}
            value={targetInput}
            onChange={(event) => setTargetInput(event.target.value)}
            aria-invalid={targetError !== null}
            className="w-full rounded-lg bg-sub px-3 py-3 text-lg font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000]"
          />
          <span className="text-[15px] text-zinc-400">本</span>
        </div>
        {targetError ? (
          <p role="alert" className="mt-2 text-xs text-red-400">
            {targetError}
          </p>
        ) : null}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-zinc-400">インターバル</p>
        <div
          role="group"
          aria-label="インターバル"
          className="mt-2 flex flex-wrap gap-2"
        >
          {INTERVAL_OPTIONS.map((seconds) => {
            const isActive = seconds === effectiveInterval;
            const isLocked = !isIntervalAllowed(seconds, intervalAccess);
            return (
              <button
                key={seconds}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleIntervalClick(seconds)}
                className={`${OPTION_BASE_CLASS} ${
                  isActive ? "bg-[#d08000] text-white" : "bg-sub text-zinc-400"
                } ${isLocked ? "opacity-50" : ""}`}
              >
                {intervalLabel(seconds)}
                {isLocked ? (
                  <LockClosedIcon className="h-3 w-3 shrink-0" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
        {intervalAccess === "free" ? (
          <p className="mt-2 text-xs leading-[18px] text-zinc-500">
            {FREE_INTERVAL_HINT}
          </p>
        ) : null}
        {intervalAccess === "pending" ? (
          <p className="mt-2 text-xs leading-[18px] text-zinc-500">
            {INTERVAL_PENDING_HINT}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <p className="text-xs leading-[18px] text-zinc-500">
          {CUE_EXCLUSIVE_HINT}
        </p>

        <ChoiceGroup
          legend="笛の音"
          value={cue.whistle}
          onChange={(next) =>
            setCue((prev) => applyCueSelection(prev, "whistle", next))
          }
        />
        <ChoiceGroup
          legend="カウント読み上げ"
          value={cue.speech}
          onChange={(next) =>
            setCue((prev) => applyCueSelection(prev, "speech", next))
          }
        />

        <ChoiceGroup
          legend="バイブレーション"
          value={vibration && canVibrate}
          onChange={handleVibrationClick}
          lockedOnEnable={!canVibrate}
        />
        {vibrationAvailability === "unsupported" ? (
          <p className="text-xs leading-[18px] text-zinc-500">
            {VIBRATION_UNSUPPORTED_HINT}
          </p>
        ) : null}
        {vibrationAvailability === "locked" ? (
          <p className="text-xs leading-[18px] text-zinc-500">
            {VIBRATION_LOCKED_HINT}
          </p>
        ) : null}
      </div>

      <div className="space-y-2 rounded-[10px] border border-zinc-600 px-4 py-3">
        <p className="text-xs leading-[18px] text-zinc-400">
          {BACKGROUND_WEB_NOTICE}
        </p>
        {!isWakeLockSupported ? (
          <p className="text-xs leading-[18px] text-zinc-400">
            {WAKE_LOCK_UNSUPPORTED_NOTICE}
          </p>
        ) : null}
      </div>

      {startError ? (
        <p role="alert" className="text-sm text-red-400">
          {startError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleStart}
        disabled={isStarting}
        className="w-full rounded-lg bg-[#d08000] py-4 text-[17px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
      >
        {START_BUTTON_LABEL}
      </button>

      <ShadowSwingStatsCard result={statsResult} />
    </div>
  );
}

interface ChoiceGroupProps {
  legend: string;
  value: boolean;
  onChange: (next: boolean) => void;
  /** 「あり」を押しても有効化できない（Pro 限定・非対応環境）ときに鍵を添える。 */
  lockedOnEnable?: boolean;
}

/** 「あり / なし」の二択。fieldset の legend が項目名になるのでラベルの重複を避けられる。 */
function ChoiceGroup({
  legend,
  value,
  onChange,
  lockedOnEnable = false,
}: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className="text-[13px] font-semibold text-zinc-400">
        {legend}
      </legend>
      <div className="mt-2 flex gap-2">
        {[
          { label: "あり", enabled: true },
          { label: "なし", enabled: false },
        ].map((option) => {
          const isActive = option.enabled === value;
          const isLocked = lockedOnEnable && option.enabled;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.enabled)}
              className={`${OPTION_BASE_CLASS} ${
                isActive ? "bg-[#d08000] text-white" : "bg-sub text-zinc-400"
              } ${isLocked ? "opacity-50" : ""}`}
            >
              {option.label}
              {isLocked ? (
                <LockClosedIcon className="h-3 w-3 shrink-0" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
