"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readOnboardingFlag,
  writeOnboardingFlag,
} from "@app/utils/onboardingStorage";

export interface OnboardingFlag {
  /**
   * フラグが立っているか。読み込みが確定するまでは null。
   * 呼び出し側は null の間なにも描画しないことで、SSR 直後の一瞬の表示を防ぐ。
   */
  isMarked: boolean | null;
  /** 今すぐ非表示にして永続化する（ユーザーが閉じた・導線を踏んだとき）。 */
  mark: () => void;
  /** 表示中の導線はそのままに、次回以降だけ抑止する（初回だけ出す導線用）。 */
  markForNextVisit: () => void;
}

/**
 * localStorage に持つ「一度きりの導線を出し終えたか」フラグを読み書きする。
 *
 * localStorage は SSR では読めないため、初期値は null（未確定）とし、
 * マウント後に一度だけ読む。この useEffect は localStorage 読み込み専用で、
 * 他の state から導出できる値の同期には使わない。
 *
 * @param key 対象のフラグキー
 */
export function useOnboardingFlag(key: string): OnboardingFlag {
  const [isMarked, setIsMarked] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMarked(readOnboardingFlag(key));
  }, [key]);

  const mark = useCallback(() => {
    setIsMarked(true);
    writeOnboardingFlag(key);
  }, [key]);

  const markForNextVisit = useCallback(() => {
    writeOnboardingFlag(key);
  }, [key]);

  return { isMarked, mark, markForNextVisit };
}
