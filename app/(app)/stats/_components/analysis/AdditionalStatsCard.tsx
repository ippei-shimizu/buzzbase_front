"use client";
import type { AdditionalStats } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface AdditionalStatsCardProps {
  stats: AdditionalStats | null;
}

/** 主要スタッツ以外の追加スタッツ（16項目）グリッド。 */
export function AdditionalStatsCard({ stats }: AdditionalStatsCardProps) {
  if (!stats) {
    return null;
  }
  const items: { label: string; value: string }[] = [
    { label: "試合", value: String(stats.games) },
    { label: "打席", value: String(stats.plate_appearances) },
    { label: "二塁打", value: String(stats.two_base_hit) },
    { label: "三塁打", value: String(stats.three_base_hit) },
    { label: "塁打", value: String(stats.total_bases) },
    { label: "得点", value: String(stats.run) },
    { label: "三振", value: String(stats.strike_out) },
    { label: "空振三振", value: String(stats.swinging_strike_out) },
    { label: "見逃三振", value: String(stats.looking_strike_out) },
    { label: "四球", value: String(stats.base_on_balls) },
    { label: "死球", value: String(stats.hit_by_pitch) },
    { label: "犠打", value: String(stats.sacrifice_hit) },
    { label: "犠飛", value: String(stats.sacrifice_fly) },
    { label: "盗塁", value: String(stats.stealing_base) },
    { label: "盗塁死", value: String(stats.caught_stealing) },
    { label: "ISO", value: formatRate(stats.iso) },
    { label: "ISOd", value: formatRate(stats.isod) },
    { label: "BB/K", value: formatRate(stats.bb_per_k) },
  ];

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="text-sm font-bold mb-3">追加スタッツ</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-xs text-zinc-400">{item.label}</span>
            <span className="text-base font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
