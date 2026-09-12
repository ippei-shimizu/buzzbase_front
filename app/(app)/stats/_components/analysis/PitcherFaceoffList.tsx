"use client";
import type { PitcherFaceoff } from "../../analysisActions";
import { useState } from "react";
import { formatBattingAverage } from "@app/utils/formatStats";
import { PitcherStatsDetailGrid } from "./PitcherStatsDetailGrid";

interface PitcherFaceoffListProps {
  rows: PitcherFaceoff[];
  minPlateAppearances: number;
  totalTargetPa: number;
}

const formatThrowHand = (
  throwHand: PitcherFaceoff["throw_hand"],
): string | null => {
  if (throwHand === "right") return "右投げ";
  if (throwHand === "left") return "左投げ";
  return null;
};

/** 対戦投手別の打撃成績一覧。各行タップで詳細グリッドを展開する。 */
export function PitcherFaceoffList({
  rows,
  minPlateAppearances,
  totalTargetPa,
}: PitcherFaceoffListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">対戦投手別</h3>
        <div className="flex flex-col items-center py-8">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            対戦データなし
          </p>
          <p className="px-4 text-center text-[11px] text-[#71717A]">
            新仕様で記録した {minPlateAppearances} 打席以上の投手が対象です
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">対戦投手別</h3>
        <span className="text-[11px] text-[#A1A1AA]">
          対戦 {rows.length} 投手 / 対象 {totalTargetPa} 打席（
          {minPlateAppearances} 打席以上のみ）
        </span>
      </div>

      {rows.map((row) => {
        const isExpanded = expandedId === row.pitcher_id;
        const attributes = [
          row.team_name,
          formatThrowHand(row.throw_hand),
          row.pitcher_style,
          row.velocity_zone,
        ].filter(Boolean);
        return (
          <div key={row.pitcher_id}>
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : row.pitcher_id)}
              aria-expanded={isExpanded}
              className="flex w-full items-center border-b border-[#27272A] py-2.5 text-left"
            >
              <div className="flex-1 overflow-hidden">
                <p className="mb-0.5 truncate text-sm font-semibold text-[#F4F4F4]">
                  {isExpanded ? "▼" : "▶"} {row.pitcher_name}
                </p>
                {attributes.length > 0 ? (
                  <p className="mb-0.5 truncate text-[11px] text-[#A1A1AA]">
                    {attributes.join("・")}
                  </p>
                ) : null}
                <p className="text-[11px] text-[#A1A1AA]">
                  {row.plate_appearances}対戦
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="mb-0.5 text-lg font-extrabold text-[#d08000]">
                  {formatBattingAverage(row.batting_average, row.at_bats)}
                </span>
                <span className="text-[11px] text-[#A1A1AA]">
                  {row.at_bats}-{row.hits}
                </span>
              </div>
            </button>
            {isExpanded ? (
              <div className="mb-1">
                <PitcherStatsDetailGrid
                  plateAppearances={row.plate_appearances}
                  atBats={row.at_bats}
                  hits={row.hits}
                  baseOnBalls={row.base_on_balls}
                  hitByPitch={row.hit_by_pitch}
                  sacrificeFly={row.sacrifice_fly}
                  battingAverage={row.batting_average}
                  onBasePercentage={row.on_base_percentage}
                  sluggingPercentage={row.slugging_percentage}
                  ops={row.ops}
                  resultCounts={row.result_counts}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
