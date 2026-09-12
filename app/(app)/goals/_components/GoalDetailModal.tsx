"use client";

import type { Goal } from "@app/types/goal";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { GOAL_PERIOD_LABELS } from "@app/constants/goal";
import { canToggleAchievement, isGoalEditable } from "../_utils/goalList";
import GoalProgressBar from "./GoalProgressBar";

interface GoalDetailModalProps {
  goal: Goal;
  isToggling: boolean;
  onClose: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onToggleAchievement: (goal: Goal) => void;
}

/** "YYYY-MM-DD" を "YYYY/M/D" へ整形する。 */
function formatDeadline(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${year}/${month}/${day}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl bg-main px-2 py-3 text-center">
      <p className="text-base font-bold text-[#d08000]">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{label}</p>
    </div>
  );
}

/** 目標の詳細（進捗・編集・削除）。 */
export default function GoalDetailModal({
  goal,
  isToggling,
  onClose,
  onEdit,
  onDelete,
  onToggleAchievement,
}: GoalDetailModalProps) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      className="buzz-dark"
    >
      <ModalContent>
        <ModalHeader className="text-white">目標の詳細</ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-xs font-bold text-zinc-400">
            {GOAL_PERIOD_LABELS[goal.period_type]}
          </p>

          <div className="rounded-[10px] bg-main px-3.5 py-3">
            <GoalProgressBar goal={goal} />
          </div>

          <div className="flex gap-2">
            <Stat
              label="進捗"
              value={`${Math.round(goal.progress_percent)}%`}
            />
            <Stat
              label="残り"
              value={
                goal.is_finalized ? "確定済み" : `${goal.days_remaining}日`
              }
            />
            <Stat label="期限" value={formatDeadline(goal.deadline)} />
          </div>

          {canToggleAchievement(goal) ? (
            <Button
              variant={goal.is_achieved ? "flat" : "bordered"}
              className={
                goal.is_achieved
                  ? "font-bold"
                  : "border-[#d08000] font-bold text-[#d08000]"
              }
              isDisabled={isToggling}
              isLoading={isToggling}
              onPress={() => onToggleAchievement(goal)}
            >
              {goal.is_achieved ? "達成を取り消す" : "達成にする"}
            </Button>
          ) : null}
        </ModalBody>
        <ModalFooter className="justify-between">
          <Button color="danger" variant="flat" onPress={() => onDelete(goal)}>
            削除
          </Button>
          <div className="flex gap-2">
            <Button variant="flat" onPress={onClose}>
              閉じる
            </Button>
            {isGoalEditable(goal) ? (
              <Button
                color="primary"
                className="font-bold"
                onPress={() => onEdit(goal)}
              >
                編集
              </Button>
            ) : null}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
