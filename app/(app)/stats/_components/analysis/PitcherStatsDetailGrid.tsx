"use client";
import type { PitcherResultCount } from "../../analysisActions";
import { formatStatRate } from "@app/utils/formatStats";

/**
 * 投手別 / 投手属性別のチップタップ展開で共通に使う詳細スタッツグリッド。
 * 上段7列: 打率/打席/打数/安打/二塁打/三塁打/本塁打、下段6列: 三振/四球/死球/出塁率/長打率/OPS。
 */
export interface PitcherStatsDetailGridProps {
  plateAppearances: number;
  atBats: number;
  hits: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacrificeFly: number;
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  ops: number;
  resultCounts: PitcherResultCount[];
}

const PR_NAMES = {
  double: "二塁打",
  triple: "三塁打",
  homerun: "本塁打",
  strikeout: "三振",
} as const;

const countOf = (counts: PitcherResultCount[], name: string): number =>
  counts.find((count) => count.plate_result_name === name)?.count ?? 0;

export function PitcherStatsDetailGrid({
  plateAppearances,
  atBats,
  hits,
  baseOnBalls,
  hitByPitch,
  sacrificeFly,
  battingAverage,
  onBasePercentage,
  sluggingPercentage,
  ops,
  resultCounts,
}: PitcherStatsDetailGridProps) {
  const obpDenom = atBats + baseOnBalls + hitByPitch + sacrificeFly;

  const primary: { label: string; value: string }[] = [
    { label: "打率", value: formatStatRate(battingAverage, atBats) },
    { label: "打席", value: String(plateAppearances) },
    { label: "打数", value: String(atBats) },
    { label: "安打", value: String(hits) },
    { label: "二塁打", value: String(countOf(resultCounts, PR_NAMES.double)) },
    { label: "三塁打", value: String(countOf(resultCounts, PR_NAMES.triple)) },
    { label: "本塁打", value: String(countOf(resultCounts, PR_NAMES.homerun)) },
  ];

  const secondary: { label: string; value: string }[] = [
    {
      label: "三振",
      value: String(countOf(resultCounts, PR_NAMES.strikeout)),
    },
    { label: "四球", value: String(baseOnBalls) },
    { label: "死球", value: String(hitByPitch) },
    { label: "出塁率", value: formatStatRate(onBasePercentage, obpDenom) },
    { label: "長打率", value: formatStatRate(sluggingPercentage, atBats) },
    // OPS = OBP + SLG。OBP が出せる（obpDenom > 0）なら OPS も出せるため母数を揃える。
    { label: "OPS", value: formatStatRate(ops, obpDenom) },
  ];

  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-[#2E2E2E] px-2.5 py-3">
      <div className="rounded-md bg-[#27272A] px-1.5 py-2">
        <div className="flex justify-around">
          {primary.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-9 flex-col items-center"
            >
              <span className="mb-0.5 text-[10px] text-[#A1A1AA]">
                {stat.label}
              </span>
              <span className="text-sm font-bold text-[#F4F4F4]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md bg-[#27272A] px-1.5 py-2">
        <div className="flex justify-around">
          {secondary.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-9 flex-col items-center"
            >
              <span className="mb-0.5 text-[10px] text-[#A1A1AA]">
                {stat.label}
              </span>
              <span className="text-[13px] font-semibold text-[#F4F4F4]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
