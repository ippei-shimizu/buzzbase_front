"use client";

import type {
  BattingStats,
  DashboardData,
  PitchingStats,
  SeasonOption,
} from "../actions";
import { useState } from "react";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import { getFilteredBattingStats, getFilteredPitchingStats } from "../actions";
import GroupRankings from "./GroupRankings";
import RecentGameResults from "./RecentGameResults";
import RecordGameButton from "./RecordGameButton";
import StatsOverview from "./StatsOverview";

interface DashboardContentProps {
  data: DashboardData | null;
  seasons: SeasonOption[];
}

export default function DashboardContent({
  data,
  seasons,
}: DashboardContentProps) {
  const [battingStats, setBattingStats] = useState<BattingStats | null>(
    data?.batting_stats ?? null,
  );
  const [pitchingStats, setPitchingStats] = useState<PitchingStats | null>(
    data?.pitching_stats ?? null,
  );

  const handleBattingFilterChange = async (
    year: string,
    matchType: string,
    seasonId?: string,
  ) => {
    const filtered = await getFilteredBattingStats(year, matchType, seasonId);
    if (filtered) {
      setBattingStats(filtered);
    }
  };

  const handlePitchingFilterChange = async (
    year: string,
    matchType: string,
    seasonId?: string,
  ) => {
    const filtered = await getFilteredPitchingStats(year, matchType, seasonId);
    if (filtered) {
      setPitchingStats(filtered);
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
        availableSeasons={seasons}
        onBattingFilterChange={handleBattingFilterChange}
        onPitchingFilterChange={handlePitchingFilterChange}
      />

      <AdInFeed
        slot={adSlots.dashboardMiddleInFeed}
        layoutKey="-6t+ed+2i-1n-4w"
      />

      <RecentGameResults results={data?.recent_game_results ?? []} />

      <GroupRankings rankings={data?.group_rankings ?? []} />
    </div>
  );
}
