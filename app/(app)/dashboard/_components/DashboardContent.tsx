"use client";

import type { DashboardData } from "../actions";
import GroupRankings from "./GroupRankings";
import RecentGameResults from "./RecentGameResults";
import RecordGameButton from "./RecordGameButton";
import StatsOverview from "./StatsOverview";

interface DashboardContentProps {
  data: DashboardData | null;
}

export default function DashboardContent({ data }: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <RecordGameButton />

      <RecentGameResults
        results={data?.recent_game_results ?? []}
      />

      <StatsOverview
        battingStats={data?.batting_stats ?? null}
        pitchingStats={data?.pitching_stats ?? null}
      />

      <GroupRankings
        rankings={data?.group_rankings ?? []}
      />
    </div>
  );
}
