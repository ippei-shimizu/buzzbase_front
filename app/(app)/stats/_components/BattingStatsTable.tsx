"use client";

import type { BattingStatsRow } from "../actions";
import StatsTable, { type Column, fmt3, fmtInt } from "./StatsTable";

const BATTING_COLUMNS: Column<BattingStatsRow>[] = [
  { key: "batting_average", label: "打率", format: fmt3, highlight: true },
  { key: "games", label: "試合", format: fmtInt },
  { key: "plate_appearances", label: "打席", format: fmtInt },
  { key: "at_bats", label: "打数", format: fmtInt },
  { key: "hit", label: "安打", format: fmtInt },
  { key: "two_base_hit", label: "二塁打", format: fmtInt },
  { key: "three_base_hit", label: "三塁打", format: fmtInt },
  { key: "home_run", label: "本塁打", format: fmtInt },
  { key: "total_bases", label: "塁打", format: fmtInt },
  { key: "runs_batted_in", label: "打点", format: fmtInt },
  { key: "run", label: "得点", format: fmtInt },
  { key: "strike_out", label: "三振", format: fmtInt },
  { key: "base_on_balls", label: "四球", format: fmtInt },
  { key: "hit_by_pitch", label: "死球", format: fmtInt },
  { key: "sacrifice_hit", label: "犠打", format: fmtInt },
  { key: "sacrifice_fly", label: "犠飛", format: fmtInt },
  { key: "stealing_base", label: "盗塁", format: fmtInt },
  { key: "caught_stealing", label: "盗塁死", format: fmtInt },
  { key: "error", label: "失策", format: fmtInt },
  { key: "slugging_percentage", label: "長打率", format: fmt3 },
  { key: "ops", label: "OPS", format: fmt3 },
  { key: "iso", label: "ISO", format: fmt3 },
  { key: "bb_per_k", label: "BB/K", format: fmt3 },
  { key: "babip", label: "BABIP", format: fmt3 },
];

interface Props {
  rows: BattingStatsRow[];
}

export default function BattingStatsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-zinc-500 text-sm py-8 text-center">
        打撃成績がありません
      </p>
    );
  }
  return <StatsTable rows={rows} columns={BATTING_COLUMNS} />;
}
