import type { GoalBadge } from "@app/types/goal";
import TrophyIcon from "@heroicons/react/24/outline/TrophyIcon";
import {
  BADGES_EMPTY_DESCRIPTION,
  BADGES_EMPTY_TITLE,
} from "../../_components/goalCopy";

// 付与日時は back が Asia/Tokyo のオフセット付きで返すが、
// 表示端末のタイムゾーンに引きずられないよう明示的に固定する。
const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function formatAwardedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return DATE_FORMATTER.format(date);
}

interface GoalBadgeListProps {
  badges: GoalBadge[];
}

/** 獲得済みの達成バッジを新しい順に並べる（並び順は back の awarded_at 降順をそのまま使う）。 */
export default function GoalBadgeList({ badges }: GoalBadgeListProps) {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg bg-sub px-4 py-10 text-center">
        <TrophyIcon className="h-10 w-10 text-zinc-500" aria-hidden />
        <p className="text-sm font-bold text-white">{BADGES_EMPTY_TITLE}</p>
        <p className="text-xs text-zinc-400">{BADGES_EMPTY_DESCRIPTION}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {badges.map((badge) => (
        <li
          key={badge.id}
          className="flex items-center gap-3 rounded-lg bg-sub p-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d08000]/20">
            <TrophyIcon className="h-6 w-6 text-[#d08000]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">{badge.badge_name}</p>
            <p className="truncate text-xs text-zinc-300">{badge.goal_title}</p>
            <p className="text-xs text-zinc-500">
              {formatAwardedAt(badge.awarded_at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
