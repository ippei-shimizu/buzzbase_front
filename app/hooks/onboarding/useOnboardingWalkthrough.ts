"use client";

import { WALKTHROUGH_COMPLETED_STORAGE_KEY } from "@app/constants/onboarding";
import { useOnboardingFlag } from "./useOnboardingFlag";

/**
 * 初回ウォークスルーの完了状態を保持するフック。
 * 完了状態の保存先はこのフックと useOnboardingFlag に閉じており、
 * サーバー保持へ移行する際もここだけを差し替えればよい。
 *
 * @returns isCompleted 完了判定。確定まで null（確定前は何も描画しない）。
 * @returns complete 完了として永続化する。スキップも完了として扱う。
 */
export function useOnboardingWalkthrough() {
  const { isMarked, mark } = useOnboardingFlag(
    WALKTHROUGH_COMPLETED_STORAGE_KEY,
  );

  return { isCompleted: isMarked, complete: mark };
}
