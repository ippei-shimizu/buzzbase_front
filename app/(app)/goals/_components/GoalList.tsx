"use client";

import type { Goal } from "@app/types/goal";
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import SolidCheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import { GOAL_PERIOD_LABELS } from "@app/constants/goal";
import { canToggleAchievement, groupGoalsByPeriod } from "../_utils/goalList";
import GoalProgressBar from "./GoalProgressBar";

interface GoalListProps {
  goals: Goal[];
  emptyMessage: string;
  /** 達成トグルの処理中で操作を止めたい目標の id。 */
  togglingId: number | null;
  onSelect: (goal: Goal) => void;
  onToggleAchievement: (goal: Goal) => void;
}

/**
 * 目標一覧（Presentational）。期間タイプごとに見出しを付けて並べる。
 * 達成トグルは定性目標にだけ出す。数値目標・自由指標は back が手動達成を 422 で拒否するため。
 */
export default function GoalList({
  goals,
  emptyMessage,
  togglingId,
  onSelect,
  onToggleAchievement,
}: GoalListProps) {
  if (goals.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-5">
      {groupGoalsByPeriod(goals).map((group) => (
        <section
          key={group.periodType}
          aria-label={GOAL_PERIOD_LABELS[group.periodType]}
        >
          <h3 className="mb-2 text-xs font-bold text-zinc-400">
            {GOAL_PERIOD_LABELS[group.periodType]}
          </h3>
          <ul className="space-y-2">
            {group.goals.map((goal) => (
              <li
                key={goal.id}
                className="flex items-center gap-3 rounded-[10px] bg-sub px-3.5 py-3"
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  aria-label={`${goal.title}の詳細`}
                  onClick={() => onSelect(goal)}
                >
                  <GoalProgressBar goal={goal} />
                </button>
                {canToggleAchievement(goal) ? (
                  <button
                    type="button"
                    className="shrink-0 text-zinc-500 transition-colors hover:text-[#d08000] disabled:opacity-50"
                    aria-label={
                      goal.is_achieved
                        ? `${goal.title}の達成を取り消す`
                        : `${goal.title}を達成にする`
                    }
                    aria-pressed={goal.is_achieved}
                    disabled={togglingId === goal.id}
                    onClick={() => onToggleAchievement(goal)}
                  >
                    {goal.is_achieved ? (
                      <SolidCheckCircleIcon className="h-7 w-7 text-[#d08000]" />
                    ) : (
                      <CheckCircleIcon className="h-7 w-7" />
                    )}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
