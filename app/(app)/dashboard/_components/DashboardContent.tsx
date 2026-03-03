"use client";

import type { BattingStats, DashboardData, PitchingStats } from "../actions";
import { useState } from "react";
import { getDashboardData } from "../actions";
import GroupRankings from "./GroupRankings";
import RecentGameResults from "./RecentGameResults";
import RecordGameButton from "./RecordGameButton";
import StatsOverview from "./StatsOverview";

interface DashboardContentProps {
  data: DashboardData | null;
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const [battingStats, setBattingStats] = useState<BattingStats | null>(
    data?.batting_stats ?? null,
  );
  const [pitchingStats, setPitchingStats] = useState<PitchingStats | null>(
    data?.pitching_stats ?? null,
  );

  const handleBattingFilterChange = async (year: string, matchType: string) => {
    const filtered = await getDashboardData(year, matchType);
    if (filtered) {
      setBattingStats(filtered.batting_stats);
    }
  };

  const handlePitchingFilterChange = async (
    year: string,
    matchType: string,
  ) => {
    const filtered = await getDashboardData(year, matchType);
    if (filtered) {
      setPitchingStats(filtered.pitching_stats);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <RecordGameButton />

      <StatsOverview
        battingStats={battingStats}
        pitchingStats={pitchingStats}
        hasBattingRecord={!!data?.batting_stats?.calculated}
        hasPitchingRecord={!!data?.pitching_stats?.calculated}
        availableYears={data?.available_years ?? []}
        onBattingFilterChange={handleBattingFilterChange}
        onPitchingFilterChange={handlePitchingFilterChange}
      />

      <RecentGameResults results={data?.recent_game_results ?? []} />

      <GroupRankings rankings={data?.group_rankings ?? []} />
    </div>
  );
}
