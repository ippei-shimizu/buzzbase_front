"use client";
import type { HeadlineStats } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface HeadlineStatsCardProps {
  stats: HeadlineStats | null;
}

interface MetricItem {
  label: string;
  value: string;
}

/**
 * stats 打撃タブ最上部の主要スタッツカード。
 * 上段: 率指標（打率 / 出塁率 / 長打率 / OPS）、下段: 累計指標（安打 / 本塁打 / 打点）。
 * 母数 0 でも 0 / .000 を表示し、ヘッダ右に at_bats を「N 打数」で出す。
 */
export function HeadlineStatsCard({ stats }: HeadlineStatsCardProps) {
  if (!stats) return null;

  const primary: MetricItem[] = [
    { label: "打率", value: formatRate(stats.batting_average) },
    { label: "出塁率", value: formatRate(stats.on_base_percentage) },
    { label: "長打率", value: formatRate(stats.slugging_percentage) },
    { label: "OPS", value: formatRate(stats.ops) },
  ];
  const secondary: MetricItem[] = [
    { label: "安打", value: String(stats.hit) },
    { label: "本塁打", value: String(stats.home_run) },
    { label: "打点", value: String(stats.runs_batted_in) },
  ];

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#F4F4F4]">主要スタッツ</h3>
        <span className="text-xs text-[#A1A1AA]">{stats.at_bats} 打数</span>
      </div>

      <div className="flex justify-between">
        {primary.map((metric) => (
          <div key={metric.label} className="flex-1 flex flex-col items-center">
            <span className="text-[22px] font-bold text-[#F4F4F4]">
              {metric.value}
            </span>
            <span className="mt-0.5 text-[11px] text-[#A1A1AA]">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-3 pt-3 border-t border-[#3a3a3a]">
        {secondary.map((metric) => (
          <div key={metric.label} className="flex-1 flex flex-col items-center">
            <span className="text-xl font-bold text-[#F4F4F4]">
              {metric.value}
            </span>
            <span className="mt-0.5 text-[11px] text-[#A1A1AA]">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
