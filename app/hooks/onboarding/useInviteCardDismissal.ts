"use client";

import { INVITE_CARD_DISMISSED_STORAGE_KEY } from "@app/constants/onboarding";
import { useOnboardingFlag } from "./useOnboardingFlag";

/**
 * ダッシュボードのグループ招待カードの dismiss 状態を保持するフック。
 * 一度閉じたら恒久的に表示しない。
 *
 * @returns isDismissed 非表示判定。確定まで null。
 * @returns dismiss 閉じて永続化する。
 */
export function useInviteCardDismissal() {
  const { isMarked, mark } = useOnboardingFlag(
    INVITE_CARD_DISMISSED_STORAGE_KEY,
  );

  return { isDismissed: isMarked, dismiss: mark };
}
