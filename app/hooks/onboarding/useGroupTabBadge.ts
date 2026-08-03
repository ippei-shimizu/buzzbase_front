"use client";

import { GROUP_TAB_BADGE_SEEN_STORAGE_KEY } from "@app/constants/onboarding";
import { useOnboardingFlag } from "./useOnboardingFlag";

/**
 * グローバルナビのグループ未参加バッジ（赤ポチ）の閲覧状態を保持するフック。
 * 一度グループを開いたらバッジは恒久的に消える。
 *
 * @returns seen 閲覧済み判定。確定まで null。
 * @returns markSeen 閲覧済みにして即座にバッジを消し、永続化する。
 */
export function useGroupTabBadge() {
  const { isMarked, mark } = useOnboardingFlag(
    GROUP_TAB_BADGE_SEEN_STORAGE_KEY,
  );

  return { seen: isMarked, markSeen: mark };
}
