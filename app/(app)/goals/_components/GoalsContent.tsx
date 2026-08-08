"use client";

import type { SeasonData, TournamentData } from "@app/interface";
import type { Goal } from "@app/types/goal";
import type { PracticeMenu } from "@app/types/practice";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
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
import { useState } from "react";
import { toast } from "sonner";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  achieveGoal,
  createGoal,
  deleteGoal,
  unachieveGoal,
  updateGoal,
} from "@app/services/v2/goalService";
import { goalForbiddenFeature } from "../_utils/goalEntitlement";
import {
  type GoalFormValues,
  buildGoalCreatePayload,
  buildGoalUpdatePayload,
} from "../_utils/goalForm";
import {
  GOAL_TABS,
  type GoalTab,
  groupGoalsByTab,
  isAtGoalFreeLimit,
} from "../_utils/goalList";
import {
  BADGES_TITLE,
  DELETE_CONFIRM_NOTICE,
  EMPTY_MESSAGE,
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_SERVER_ERROR,
  FREE_LIMIT_TITLE,
  HISTORY_LOAD_ERROR_MESSAGE,
} from "./goalCopy";
import GoalDetailModal from "./GoalDetailModal";
import GoalFormModal from "./GoalFormModal";
import GoalList from "./GoalList";

interface GoalsContentProps {
  initialGoals: Goal[];
  initialHistory: Goal[];
  /** 履歴の取得に失敗したか。空配列と区別して「未達が0件」の誤表示を避ける。 */
  historyLoadFailed: boolean;
  seasons: SeasonData[];
  tournaments: TournamentData[];
  menus: PracticeMenu[];
  today: string;
}

/** フォームを開くたびに増やし、key の付け替えで入力状態を初期化するための識別子。 */
interface FormTarget {
  goal: Goal | null;
  token: number;
}

/**
 * 目標画面の Container。
 * 一覧の状態保持・Server Action 呼び出し・Pro / 無料枠の判定を担い、表示は子コンポーネントへ委ねる。
 */
export default function GoalsContent({
  initialGoals,
  initialHistory,
  historyLoadFailed,
  seasons,
  tournaments,
  menus,
  today,
}: GoalsContentProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [history, setHistory] = useState<Goal[]>(initialHistory);
  const [tab, setTab] = useState<GoalTab>("in_progress");
  const [form, setForm] = useState<FormTarget | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const goalsByTab = groupGoalsByTab(goals, history);
  const detailGoal =
    [...goals, ...history].find((goal) => goal.id === detailId) ?? null;
  const isAtFreeLimit = isAtGoalFreeLimit({
    activeGoals: goals,
    hasUnlimited: hasEntitlement("unlimited_monthly_goals"),
    isEntitlementLoading,
  });

  const replaceGoal = (updated: Goal) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === updated.id ? updated : goal)),
    );
    setHistory((prev) =>
      prev.map((goal) => (goal.id === updated.id ? updated : goal)),
    );
  };

  const openForm = (goal: Goal | null) => {
    setFormErrors([]);
    setForm({ goal, token: Date.now() + goals.length });
  };

  const handleAdd = () => {
    if (isAtFreeLimit) {
      openProUpgradeModal({ trigger: "unlimited_monthly_goals" });
      return;
    }
    openForm(null);
  };

  const handleSubmit = async (values: GoalFormValues) => {
    const editing = form?.goal ?? null;
    setIsSaving(true);
    setFormErrors([]);

    const result = editing
      ? await updateGoal(
          editing.id,
          buildGoalUpdatePayload(values, editing, today),
        )
      : await createGoal(buildGoalCreatePayload(values, today));
    setIsSaving(false);

    if (result.ok) {
      if (editing) {
        replaceGoal(result.data);
      } else {
        setGoals((prev) => [...prev, result.data]);
      }
      setForm(null);
      toast.success(editing ? "目標を更新しました" : "目標を作成しました");
      return;
    }

    if (result.reason === "forbidden") {
      // back は Pro 限定機能も無料枠超過も 403 で返す。どちらだったかは送った内容から判定する。
      const feature = goalForbiddenFeature({
        kind: values.kind,
        periodType: values.periodType,
      });
      // 件数上限のときの back の文言は「Pro プランで期間目標を無制限に設定できます」で、
      // 何件までなのかが伝わらないため、上限を明示した文言へ置き換える。
      setFormErrors(
        feature === "unlimited_monthly_goals"
          ? [FREE_LIMIT_SERVER_ERROR]
          : result.errors,
      );
      openProUpgradeModal({ trigger: feature });
      return;
    }
    setFormErrors(result.errors);
  };

  const handleToggleAchievement = async (goal: Goal) => {
    setTogglingId(goal.id);
    const result = goal.is_achieved
      ? await unachieveGoal(goal.id)
      : await achieveGoal(goal.id);
    setTogglingId(null);

    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    replaceGoal(result.data);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteGoal(deleteTarget.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    setGoals((prev) => prev.filter((goal) => goal.id !== deleteTarget.id));
    setHistory((prev) => prev.filter((goal) => goal.id !== deleteTarget.id));
    setDetailId(null);
    setDeleteTarget(null);
    toast.success("目標を削除しました");
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold">目標</h2>
        <Link
          href="/goals/badges"
          className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm text-[#d08000]"
        >
          <TrophyIcon className="h-4 w-4" aria-hidden />
          {BADGES_TITLE}
        </Link>
      </div>
      <p className="mt-2 text-xs text-zinc-300">
        練習量や成績の目標を決めると、記録した内容から進み具合を自動で計算します。数字にできない目標は達成ボタンで管理できます。
      </p>

      {historyLoadFailed ? (
        <p className="mt-4 rounded-lg bg-sub p-3 text-xs text-zinc-300">
          {HISTORY_LOAD_ERROR_MESSAGE}
        </p>
      ) : null}

      <div className="my-5 flex gap-2" role="tablist" aria-label="目標の状態">
        {GOAL_TABS.map((item) => {
          const isActive = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                isActive ? "bg-[#d08000] text-white" : "bg-sub text-zinc-400"
              }`}
            >
              {item.label}
              <span className="text-xs">{goalsByTab[item.key].length}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <GoalList
          goals={goalsByTab[tab]}
          emptyMessage={EMPTY_MESSAGE[tab]}
          togglingId={togglingId}
          onSelect={(goal) => setDetailId(goal.id)}
          onToggleAchievement={handleToggleAchievement}
        />
      </div>

      {isAtFreeLimit ? (
        <ProUpsellCard
          feature="unlimited_monthly_goals"
          title={FREE_LIMIT_TITLE}
          description={FREE_LIMIT_DESCRIPTION}
          className="mb-4"
        />
      ) : null}

      <Button
        color="primary"
        fullWidth
        radius="sm"
        className="font-bold"
        startContent={<PlusIcon className="h-5 w-5" aria-hidden />}
        isDisabled={isEntitlementLoading}
        onPress={handleAdd}
      >
        新しい目標を追加
      </Button>

      {form ? (
        <GoalFormModal
          key={form.token}
          goal={form.goal}
          seasons={seasons}
          tournaments={tournaments}
          menus={menus}
          today={today}
          isSaving={isSaving}
          serverErrors={formErrors}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailGoal ? (
        <GoalDetailModal
          goal={detailGoal}
          isToggling={togglingId === detailGoal.id}
          onClose={() => setDetailId(null)}
          onEdit={(goal) => {
            setDetailId(null);
            openForm(goal);
          }}
          onDelete={(goal) => {
            // 詳細の上に確認モーダルを重ねると背面が aria-hidden になり読み上げが届かないため、
            // 詳細を閉じてから確認へ切り替える。
            setDetailId(null);
            setDeleteTarget(goal);
          }}
          onToggleAchievement={handleToggleAchievement}
        />
      ) : null}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">目標の削除</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{deleteTarget?.title}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">{DELETE_CONFIRM_NOTICE}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setDeleteTarget(null)}
              isDisabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
