import type { BattingStatsRow } from "../actions";
import { SCORING_POSITION_BATTING_AVERAGE_TOOLTIP } from "@app/constants/battingTooltips";
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
  {
    key: "scoring_position_batting_average",
    label: "得点圏打率",
    format: fmt3,
    tooltip: SCORING_POSITION_BATTING_AVERAGE_TOOLTIP,
    dashWhenMissing: true,
  },
  { key: "iso", label: "ISO", format: fmt3 },
  { key: "bb_per_k", label: "BB/K", format: fmt3 },
  { key: "babip", label: "BABIP", format: fmt3 },
];

// 本塁打の内数なので、走本塁打が 1 本も無いときは列ごと出さない（getBattingColumns で判定）。
const INSIDE_THE_PARK_HOME_RUN_COLUMN: Column<BattingStatsRow> = {
  key: "inside_the_park_home_run",
  label: "走本",
  format: fmtInt,
  tooltip:
    "本塁打の内数（ランニング本塁打）。本塁打の数には走本塁打も含まれます。",
};

/**
 * 打撃成績テーブルの列定義を返す。
 * 走本塁打が 1 本以上ある行があるときだけ「本塁打」の右隣に「走本」列を差し込む。
 */
export function getBattingColumns(
  rows: BattingStatsRow[],
): Column<BattingStatsRow>[] {
  const hasInsideThePark = rows.some(
    (row) => (row.inside_the_park_home_run ?? 0) > 0,
  );
  if (!hasInsideThePark) return BATTING_COLUMNS;

  const homeRunIndex = BATTING_COLUMNS.findIndex(
    (column) => column.key === "home_run",
  );
  return [
    ...BATTING_COLUMNS.slice(0, homeRunIndex + 1),
    INSIDE_THE_PARK_HOME_RUN_COLUMN,
    ...BATTING_COLUMNS.slice(homeRunIndex + 1),
  ];
}

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
  return <StatsTable rows={rows} columns={getBattingColumns(rows)} />;
}
