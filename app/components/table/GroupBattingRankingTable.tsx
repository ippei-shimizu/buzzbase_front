"use client";

import { useMemo } from "react";
import RankingSection from "./RankingSection";

type BattingAverage = {
  hit: number | null;
  home_run: number | null;
  id: number | null;
  runs_batted_in: number | null;
  stealing_base: number | null;
  name: string;
  user_id: string;
  image_url: string;
};

type BattingStats = {
  batting_average: number;
  on_base_percentage: number;
  name: string;
  user_id: string;
  image_url: string;
};

type Props = {
  battingAverage: BattingAverage[] | undefined;
  battingStats: BattingStats[] | undefined;
};

export default function GroupBattingRankingTable(props: Props) {
  const { battingAverage, battingStats } = props;

  function formatNumber(value: number): string {
    if (value < 1 && value > -1) {
      return value.toFixed(3).replace("0", "");
    }
    return value.toFixed(3);
  }

  const sortedBattingAverage = useMemo(
    () =>
      battingStats
        ?.slice()
        .sort((a, b) => b.batting_average - a.batting_average) || [],
    [battingStats],
  );

  const sortedHomeRun = useMemo(
    () =>
      battingAverage
        ?.slice()
        .sort((a, b) => (b.home_run ?? 0) - (a.home_run ?? 0)) || [],
    [battingAverage],
  );

  const sortedRunsBattedIn = useMemo(
    () =>
      battingAverage
        ?.slice()
        .sort((a, b) => (b.runs_batted_in ?? 0) - (a.runs_batted_in ?? 0)) ||
      [],
    [battingAverage],
  );

  const sortedHit = useMemo(
    () =>
      battingAverage?.slice().sort((a, b) => (b.hit ?? 0) - (a.hit ?? 0)) || [],
    [battingAverage],
  );

  const sortedStealingBase = useMemo(
    () =>
      battingAverage
        ?.slice()
        .sort((a, b) => (b.stealing_base ?? 0) - (a.stealing_base ?? 0)) || [],
    [battingAverage],
  );

  const sortedOnBasePercentage = useMemo(
    () =>
      battingStats
        ?.slice()
        .sort((a, b) => b.on_base_percentage - a.on_base_percentage) || [],
    [battingStats],
  );

  const sections = [
    {
      label: "打率",
      id: "battingAverage",
      data: sortedBattingAverage,
      renderValue: (item: BattingStats) => formatNumber(item.batting_average),
    },
    {
      label: "本塁打",
      id: "homeRun",
      data: sortedHomeRun,
      renderValue: (item: BattingAverage) => item.home_run,
    },
    {
      label: "打点",
      id: "run",
      data: sortedRunsBattedIn,
      renderValue: (item: BattingAverage) => item.runs_batted_in,
    },
    {
      label: "安打",
      id: "hit",
      data: sortedHit,
      renderValue: (item: BattingAverage) => item.hit,
    },
    {
      label: "盗塁",
      id: "stealingBase",
      data: sortedStealingBase,
      renderValue: (item: BattingAverage) => item.stealing_base,
    },
    {
      label: "出塁率",
      id: "onBasePercentage",
      data: sortedOnBasePercentage,
      renderValue: (item: BattingStats) =>
        formatNumber(item.on_base_percentage),
    },
  ];

  return (
    <>
      {sections.map((section, index) => (
        <RankingSection
          key={section.id}
          label={section.label}
          id={section.id}
          data={section.data}
          renderValue={section.renderValue}
          isFirst={index === 0}
        />
      ))}
    </>
  );
}
