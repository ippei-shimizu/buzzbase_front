"use client";
import type { PitchTypeRow } from "../../analysisActions";
import { useState } from "react";
import { formatBattingAverage } from "@app/utils/formatStats";
import { PitcherStatsDetailGrid } from "./PitcherStatsDetailGrid";

interface PitchTypeCardProps {
  rows: PitchTypeRow[];
  totalTargetPa: number;
}

const SECTION_LIMIT = 3;

function InsightRow({
  row,
  highlightColor,
  isExpanded,
  onToggle,
}: {
  row: PitchTypeRow;
  highlightColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="mb-1 flex w-full items-center justify-between rounded-lg bg-[#27272A] px-2.5 py-2 text-left"
    >
      <span className="flex-1 text-[13px] font-semibold text-[#F4F4F4]">
        {isExpanded ? "▼" : "▶"} {row.label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span
          className="text-lg font-extrabold"
          style={{ color: highlightColor }}
        >
          {formatBattingAverage(row.batting_average, row.at_bats)}
        </span>
        <span className="text-[11px] text-[#71717A]">
          ({row.at_bats}-{row.hits})
        </span>
      </span>
    </button>
  );
}

/**
 * 球種別の打率カード。打数1以上を打率降順に並べ、上位を「得意」下位を「苦手」として
 * ハイライトし、0打数の球種は「その他 N 球種」に集約する。行タップで詳細グリッドを展開。
 */
export function PitchTypeCard({ rows, totalTargetPa }: PitchTypeCardProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (totalTargetPa === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">球種別の打率</h3>
        <div className="flex flex-col items-center py-8">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            対象データなし
          </p>
          <p className="text-[11px] text-[#71717A]">
            新仕様で記録した打席のみが対象です
          </p>
        </div>
      </section>
    );
  }

  const activeRows = rows.filter((row) => row.at_bats > 0);
  const sortedByAverage = [...activeRows].sort(
    (a, b) => b.batting_average - a.batting_average,
  );
  const goodRows = sortedByAverage.slice(0, SECTION_LIMIT);
  const goodIds = new Set(goodRows.map((row) => row.id));
  const remaining = sortedByAverage.filter((row) => !goodIds.has(row.id));
  const badRowsCandidate = remaining.slice(-SECTION_LIMIT).reverse();
  const showBadSection =
    goodRows.length >= SECTION_LIMIT && badRowsCandidate.length > 0;
  const badRows = showBadSection ? badRowsCandidate : [];
  const zeroCount = rows.length - activeRows.length;

  const renderRow = (row: PitchTypeRow, highlightColor: string) => {
    const isExpanded = expandedId === row.id;
    return (
      <div key={row.id}>
        <InsightRow
          row={row}
          highlightColor={highlightColor}
          isExpanded={isExpanded}
          onToggle={() => setExpandedId(isExpanded ? null : row.id)}
        />
        {isExpanded ? (
          <div className="mb-1.5">
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
  };

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">球種別の打率</h3>
        <span className="text-[11px] text-[#A1A1AA]">
          対象 {totalTargetPa} 打席
        </span>
      </div>

      {goodRows.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold tracking-wide text-[#A1A1AA]">
            得意
          </p>
          {goodRows.map((row) => renderRow(row, "#d08000"))}
        </div>
      ) : null}

      {badRows.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold tracking-wide text-[#A1A1AA]">
            苦手
          </p>
          {badRows.map((row) => renderRow(row, "#A1A1AA"))}
        </div>
      ) : null}

      {zeroCount > 0 ? (
        <p className="mt-1 text-center text-[11px] text-[#71717A]">
          その他 {zeroCount} 球種（0 打数）
        </p>
      ) : null}
    </section>
  );
}
