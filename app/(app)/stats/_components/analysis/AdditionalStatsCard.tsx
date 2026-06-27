"use client";
import type { AdditionalStats } from "../../analysisActions";

interface AdditionalStatsCardProps {
  stats: AdditionalStats | null;
}

type StatKey = keyof AdditionalStats;
type CellFormat = "rate" | "count" | "ratio";

interface CellConfig {
  key: StatKey;
  label: string;
  format: CellFormat;
}

// マイページ / ダッシュボードの SummaryStatsTable と同じ並び順で、
// 主要スタッツ（HeadlineStatsCard）以外の 16 項目を 4 列 × 4 行で表示する。
// 「三振」セルだけはメイン数値の下に「空 N / 見 M」のサブテキストで内訳を見せる。
const CELLS: readonly CellConfig[] = [
  { key: "games", label: "試合", format: "count" },
  { key: "plate_appearances", label: "打席", format: "count" },
  { key: "two_base_hit", label: "二塁打", format: "count" },
  { key: "three_base_hit", label: "三塁打", format: "count" },
  { key: "total_bases", label: "塁打", format: "count" },
  { key: "run", label: "得点", format: "count" },
  { key: "strike_out", label: "三振", format: "count" },
  { key: "base_on_balls", label: "四球", format: "count" },
  { key: "hit_by_pitch", label: "死球", format: "count" },
  { key: "sacrifice_hit", label: "犠打", format: "count" },
  { key: "sacrifice_fly", label: "犠飛", format: "count" },
  { key: "stealing_base", label: "盗塁", format: "count" },
  { key: "caught_stealing", label: "盗塁死", format: "count" },
  { key: "iso", label: "ISO", format: "rate" },
  { key: "isod", label: "ISOD", format: "rate" },
  { key: "bb_per_k", label: "BB/K", format: "ratio" },
] as const;

const formatValue = (value: number, format: CellFormat): string => {
  switch (format) {
    case "rate":
      // 1.000 以上もありうるので、その場合は先頭 "0." 置換は不要。
      return value >= 1
        ? value.toFixed(3)
        : value.toFixed(3).replace(/^0\./, ".");
    case "ratio":
      return value.toFixed(2);
    case "count":
    default:
      return String(value);
  }
};

/** 主要スタッツ以外の追加スタッツ（16項目）を 4×4 グリッドで表示する。 */
export function AdditionalStatsCard({ stats }: AdditionalStatsCardProps) {
  if (!stats) return null;

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <div className="flex flex-wrap">
        {CELLS.map((cell) => (
          <div key={cell.key} className="flex w-1/4 flex-col items-center py-2">
            <span className="mb-1 text-[11px] font-semibold text-[#A1A1AA]">
              {cell.label}
            </span>
            <span className="text-base font-bold text-[#F4F4F4]">
              {formatValue(stats[cell.key], cell.format)}
            </span>
            {cell.key === "strike_out" ? (
              <span className="mt-0.5 text-[10px] text-[#A1A1AA]">
                空 {stats.swinging_strike_out} / 見 {stats.looking_strike_out}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
