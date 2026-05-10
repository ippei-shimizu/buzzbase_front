import type { PitchingStatsRow } from "../actions";
import StatsTable, { type Column, fmt2, fmtInt } from "./StatsTable";

const INNING_FORMAT_TOOLTIP =
  "試合のイニング制（7回制 or 9回制）に応じて計算されます。";

const PITCHING_COLUMNS: Column<PitchingStatsRow>[] = [
  {
    key: "era",
    label: "防御率",
    format: fmt2,
    highlight: true,
    tooltip: INNING_FORMAT_TOOLTIP,
  },
  { key: "appearances", label: "登板", format: fmtInt },
  { key: "win", label: "勝利", format: fmtInt },
  { key: "loss", label: "敗戦", format: fmtInt },
  { key: "hold", label: "ホールド", format: fmtInt },
  { key: "saves", label: "セーブ", format: fmtInt },
  { key: "complete_games", label: "完投", format: fmtInt },
  { key: "shutouts", label: "完封", format: fmtInt },
  { key: "innings_pitched", label: "投球回", format: fmt2 },
  { key: "hits_allowed", label: "被安打", format: fmtInt },
  { key: "home_runs_hit", label: "被本塁打", format: fmtInt },
  { key: "strikeouts", label: "三振", format: fmtInt },
  { key: "base_on_balls", label: "四球", format: fmtInt },
  { key: "hit_by_pitch", label: "死球", format: fmtInt },
  { key: "run_allowed", label: "失点", format: fmtInt },
  { key: "earned_run", label: "自責点", format: fmtInt },
  { key: "whip", label: "WHIP", format: fmt2 },
  {
    key: "k_per_nine",
    label: "K/9",
    format: fmt2,
    tooltip: INNING_FORMAT_TOOLTIP,
  },
  {
    key: "bb_per_nine",
    label: "BB/9",
    format: fmt2,
    tooltip: INNING_FORMAT_TOOLTIP,
  },
  { key: "k_bb", label: "K/BB", format: fmt2 },
];

interface Props {
  rows: PitchingStatsRow[];
}

export default function PitchingStatsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-zinc-500 text-sm py-8 text-center">
        投手成績がありません
      </p>
    );
  }
  return <StatsTable rows={rows} columns={PITCHING_COLUMNS} />;
}
