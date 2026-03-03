import type { GroupRanking, RankingEntry } from "../actions";
import { Avatar } from "@heroui/react";
import Link from "next/link";

interface GroupRankingsProps {
  rankings: GroupRanking[];
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "bg-yellow-500 text-zinc-900",
    2: "bg-zinc-300 text-zinc-900",
    3: "bg-amber-700 text-white",
  };
  const colorClass = colors[rank] ?? "bg-zinc-700 text-zinc-300";

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${colorClass}`}
    >
      {rank}
      <span className="text-[9px]">位</span>
    </span>
  );
}

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null || change === undefined) return null;

  if (change > 0) {
    return (
      <span className="text-green-400 text-xs font-semibold">↑{change}</span>
    );
  }
  if (change < 0) {
    return (
      <span className="text-red-400 text-xs font-semibold">
        ↓{Math.abs(change)}
      </span>
    );
  }
  return <span className="text-zinc-500 text-xs font-semibold">→</span>;
}

function rankRowBg(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-yellow-500/10";
    case 2:
      return "bg-zinc-300/8";
    case 3:
      return "bg-amber-700/8";
    default:
      return "";
  }
}

function RankingRow({ entry }: { entry: RankingEntry }) {
  if (entry.current_rank === null) return null;

  return (
    <div
      className={`flex items-center justify-between py-2 px-2 -mx-2 rounded-md ${rankRowBg(entry.current_rank)}`}
    >
      <div className="flex items-center gap-2">
        <RankBadge rank={entry.current_rank} />
        <span className="text-sm text-zinc-300">{entry.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">
          {entry.value !== null ? entry.value : "-"}
        </span>
        <ChangeIndicator change={entry.change} />
      </div>
    </div>
  );
}

export default function GroupRankings({ rankings }: GroupRankingsProps) {
  return (
    <section>
      <h3 className="text-lg font-bold mb-3">グループランキング</h3>

      {rankings.length === 0 ? (
        <div className="rounded-lg border border-zinc-700 p-6 text-center">
          <p className="text-zinc-400">所属グループはありません</p>
          <p className="text-zinc-500 text-sm mt-1">
            グループに参加するとランキングが表示されます
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rankings.map((group) => {
            const battingEntries = group.batting_rankings.filter(
              (e) => e.current_rank !== null,
            );
            const pitchingEntries = group.pitching_rankings.filter(
              (e) => e.current_rank !== null,
            );
            const hasEntries =
              battingEntries.length > 0 || pitchingEntries.length > 0;

            return (
              <div
                key={group.group_id}
                className="rounded-lg border border-zinc-700 p-4"
              >
                <Link
                  href={`/groups/${group.group_id}`}
                  className="flex items-center gap-3 mb-3 transition-opacity hover:opacity-80"
                >
                  <Avatar
                    src={
                      group.group_icon
                        ? process.env.NODE_ENV === "production"
                          ? group.group_icon
                          : `${process.env.NEXT_PUBLIC_API_URL}${group.group_icon}`
                        : `${process.env.NEXT_PUBLIC_API_URL}/images/group/group-default-yellow.svg`
                    }
                    size="sm"
                    isBordered
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{group.group_name}</p>
                    <p className="text-xs text-zinc-500">
                      {group.total_members}人
                    </p>
                  </div>
                  <span className="text-zinc-400 text-3xl">›</span>
                </Link>

                {!hasEntries ? (
                  <p className="text-sm text-zinc-500 text-center py-2">
                    ランキングデータがありません
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {battingEntries.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-400 mb-1">
                          打撃
                        </h5>
                        <div className="divide-y divide-zinc-800">
                          {battingEntries.map((entry) => (
                            <RankingRow key={entry.stat_type} entry={entry} />
                          ))}
                        </div>
                      </div>
                    )}

                    {pitchingEntries.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-400 mb-1">
                          投手
                        </h5>
                        <div className="divide-y divide-zinc-800">
                          {pitchingEntries.map((entry) => (
                            <RankingRow key={entry.stat_type} entry={entry} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
