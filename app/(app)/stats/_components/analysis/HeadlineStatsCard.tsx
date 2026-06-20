"use client";
import type { HeadlineStats } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface HeadlineStatsCardProps {
  stats: HeadlineStats | null;
}

/** 打撃の主要スタッツ（打率・安打・本塁打・打点・OBP・SLG・OPS）カード。 */
export function HeadlineStatsCard({ stats }: HeadlineStatsCardProps) {
  if (!stats || stats.at_bats === 0) {
    return (
      <section className="rounded-xl bg-bg_sub p-4">
        <p className="text-sm text-zinc-500">打撃データがありません。</p>
      </section>
    );
  }

  const items: { label: string; value: string }[] = [
    { label: "安打", value: String(stats.hit) },
    { label: "本塁打", value: String(stats.home_run) },
    { label: "打点", value: String(stats.runs_batted_in) },
    { label: "出塁率", value: formatRate(stats.on_base_percentage) },
    { label: "長打率", value: formatRate(stats.slugging_percentage) },
    { label: "OPS", value: formatRate(stats.ops) },
  ];

  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-4">
      <div className="flex items-end gap-x-3">
        <span className="text-sm text-zinc-400">打率</span>
        <span className="text-4xl font-bold text-yellow-500">
          {formatRate(stats.batting_average)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-xs text-zinc-400">{item.label}</span>
            <span className="text-lg font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
