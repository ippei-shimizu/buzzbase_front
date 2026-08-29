import type { FetchResult } from "@app/services/v2/requests";
import type { Goal } from "@app/types/goal";
import FlagIcon from "@heroicons/react/24/outline/FlagIcon";
import Link from "next/link";
import GoalProgressBar from "@app/(app)/goals/_components/GoalProgressBar";
import { groupGoalsByPeriod } from "@app/(app)/goals/_utils/goalList";
import { GOAL_PERIOD_LABELS } from "@app/constants/goal";
import {
  GOALS_EMPTY,
  GOALS_LOAD_ERROR,
  GOALS_MANAGE_LABEL,
  GOALS_SECTION_TITLE,
} from "./activityCopy";
import SectionCard, { SectionEmpty, SectionError } from "./SectionCard";

interface GoalSectionProps {
  /** 進行中（未確定）の目標。 */
  goalsResult: FetchResult<Goal[]>;
}

/** 期間タイプごとの見出し付きで進捗を並べる。0件の期間タイプは出さない。 */
function GoalGroups({ goals }: { goals: Goal[] }) {
  return (
    <>
      {groupGoalsByPeriod(goals).map((group) => (
        <div key={group.periodType} className="mb-2 last:mb-0">
          <p className="mb-1.5 text-xs font-bold text-zinc-400">
            {GOAL_PERIOD_LABELS[group.periodType]}
          </p>
          <ul className="flex flex-col gap-2">
            {group.goals.map((goal) => (
              <li key={goal.id} className="rounded-xl bg-main px-3 py-2.5">
                <GoalProgressBar goal={goal} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/**
 * 進行中の目標の進捗。
 * 目標は「課題への取り組みを何のためにやるか」を示す軸なので、課題のすぐ下に置く。
 */
export default function GoalSection({ goalsResult }: GoalSectionProps) {
  return (
    <SectionCard title={GOALS_SECTION_TITLE}>
      {goalsResult.status !== "ok" ? (
        <SectionError message={GOALS_LOAD_ERROR} />
      ) : goalsResult.data.length === 0 ? (
        <SectionEmpty message={GOALS_EMPTY} />
      ) : (
        <GoalGroups goals={goalsResult.data} />
      )}
      <Link
        href="/goals"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-[#d08000] bg-[#d08000]/10 py-2.5 text-[13px] font-bold text-[#d08000]"
      >
        <FlagIcon className="h-4 w-4 shrink-0" aria-hidden />
        {GOALS_MANAGE_LABEL}
      </Link>
    </SectionCard>
  );
}
