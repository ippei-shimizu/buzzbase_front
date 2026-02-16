"use client";

import { useMemo } from "react";
import RankingSection from "./RankingSection";

type PitchingAggregate = {
  win: number;
  hold: number;
  saves: number;
  strikeouts: number;
  name: string;
  user_id: string;
  image_url: string;
};

type PitchingStats = {
  era: number;
  win_percentage: number;
  name: string;
  user_id: string;
  image_url: string;
};

type Props = {
  pitchingAggregate: PitchingAggregate[] | undefined;
  pitchingStats: PitchingStats[] | undefined;
};

export default function GroupPitchingRankingTable(props: Props) {
  const { pitchingAggregate, pitchingStats } = props;

  function formatNumber(value: number): string {
    if (value < 1 && value > -1) {
      return value.toFixed(3).replace("0", "");
    }
    return value.toFixed(2);
  }

  const sortedPitchingEra = useMemo(
    () => pitchingStats?.slice().sort((a, b) => a.era - b.era) || [],
    [pitchingStats],
  );

  const sortedWin = useMemo(
    () =>
      pitchingAggregate?.slice().sort((a, b) => (b.win ?? 0) - (a.win ?? 0)) ||
      [],
    [pitchingAggregate],
  );

  const sortedSaves = useMemo(
    () =>
      pitchingAggregate
        ?.slice()
        .sort((a, b) => (b.saves ?? 0) - (a.saves ?? 0)) || [],
    [pitchingAggregate],
  );

  const sortedHp = useMemo(
    () =>
      pitchingAggregate
        ?.slice()
        .sort((a, b) => (b.hold ?? 0) - (a.hold ?? 0)) || [],
    [pitchingAggregate],
  );

  const sortedStrikeouts = useMemo(
    () =>
      pitchingAggregate
        ?.slice()
        .sort((a, b) => (b.strikeouts ?? 0) - (a.strikeouts ?? 0)) || [],
    [pitchingAggregate],
  );

  const sortedWinPercentage = useMemo(
    () =>
      pitchingStats
        ?.slice()
        .sort((a, b) => b.win_percentage - a.win_percentage) || [],
    [pitchingStats],
  );

  const sections = [
    {
      label: "防御率",
      id: "era",
      data: sortedPitchingEra,
      renderValue: (item: PitchingStats) => formatNumber(item.era),
    },
    {
      label: "勝利",
      id: "win",
      data: sortedWin,
      renderValue: (item: PitchingAggregate) => item.win,
    },
    {
      label: "セーブ",
      id: "saves",
      data: sortedSaves,
      renderValue: (item: PitchingAggregate) => item.saves,
    },
    {
      label: "HP",
      id: "hp",
      data: sortedHp,
      renderValue: (item: PitchingAggregate) => item.hold,
    },
    {
      label: "奪三振",
      id: "strikeouts",
      data: sortedStrikeouts,
      renderValue: (item: PitchingAggregate) => item.strikeouts,
    },
    {
      label: "勝率",
      id: "winPercentage",
      data: sortedWinPercentage,
      renderValue: (item: PitchingStats) => formatNumber(item.win_percentage),
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
