"use client";

import type { Goal, GoalBadge } from "@app/types/goal";
import TrophyIcon from "@heroicons/react/24/outline/TrophyIcon";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Link from "next/link";
import { achievementSummaryShownKey } from "@app/constants/goal";
import { useOnboardingFlag } from "@app/hooks/onboarding/useOnboardingFlag";
import {
  formatMonthKeyJa,
  hasAchievementSummary,
  summarizeAchievements,
} from "../_utils/achievementSummary";

interface AchievementSummaryModalProps {
  /** 振り返る対象月（YYYY-MM）。SSR / CSR でずれないようサーバー側で確定させて渡す。 */
  monthKey: string;
  history: Goal[];
  badges: GoalBadge[];
}

/**
 * 前月に期限を迎えた目標の達成サマリーを、その月について一度だけ表示するモーダル。
 *
 * 表示済みの記録は月キーを含む localStorage のキーで持つため、
 * 翌月になればキーが変わり、再び一度だけ表示される。
 */
export default function AchievementSummaryModal({
  monthKey,
  history,
  badges,
}: AchievementSummaryModalProps) {
  const { isMarked, mark } = useOnboardingFlag(
    achievementSummaryShownKey(monthKey),
  );
  const summary = summarizeAchievements(history, badges, monthKey);

  // 読み込み確定前（null）に描画すると、表示済みでも一瞬モーダルが見えてしまう。
  if (isMarked !== false) return null;
  if (!hasAchievementSummary(summary)) return null;

  return (
    <Modal isOpen onClose={mark} placement="center" className="buzz-dark">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 text-white">
          <TrophyIcon className="h-5 w-5 text-[#d08000]" aria-hidden />
          {formatMonthKeyJa(monthKey)}の振り返り
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-white">
            期限を迎えた目標{summary.finalizedCount}件中{" "}
            <span className="font-bold text-[#d08000]">
              {summary.achievedCount}件達成
            </span>
          </p>
          {summary.badgeCount > 0 ? (
            <p className="text-xs text-zinc-400">
              新しいバッジを{summary.badgeCount}個獲得しました
            </p>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={mark}>
            閉じる
          </Button>
          <Button as={Link} href="/goals/badges" color="primary" onPress={mark}>
            バッジを見る
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
