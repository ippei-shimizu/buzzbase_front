"use client";

import { GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY } from "@app/constants/onboarding";
import { useOnboardingFlag } from "./useOnboardingFlag";

/**
 * グループ一覧の「招待コードで参加」ツールチップを初回訪問の1回だけ出すためのフック。
 *
 * @returns hasShown 表示済み判定。確定まで null。
 * @returns markShown 表示済みとして永続化する。今表示しているツールチップは消さず、
 *   次回訪問以降だけ抑止する。
 */
export function useGroupJoinTooltip() {
  const { isMarked, markForNextVisit } = useOnboardingFlag(
    GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY,
  );

  return { hasShown: isMarked, markShown: markForNextVisit };
}
