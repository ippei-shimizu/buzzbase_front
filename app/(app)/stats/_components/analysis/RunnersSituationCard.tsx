"use client";
import type { RunnersSituationSummary } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface RunnersSituationCardProps {
  stats: RunnersSituationSummary | null;
}

/**
 * 得点圏（runners_state IN 2..7）打率カード。
 * 母数 0（ランナー状況付きの新仕様 PA がまだ無いケース）は「対象データなし」表示に分岐し、
 * 旧データのみのユーザーで違和感が出ないようにする。
 */
export function RunnersSituationCard({ stats }: RunnersSituationCardProps) {
  if (!stats) return null;
  const hasData = stats.at_bats > 0;

  const singles = Math.max(
    0,
    stats.hits - stats.two_base_hit - stats.three_base_hit - stats.home_run,
  );
  const chips: { label: string; value: number }[] = [
    { label: "単打", value: singles },
    { label: "二塁打", value: stats.two_base_hit },
    { label: "三塁打", value: stats.three_base_hit },
    { label: "本塁打", value: stats.home_run },
  ];

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="mb-1.5 text-sm font-bold text-[#F4F4F4]">得点圏打率</h3>

      {hasData ? (
        <>
          <p className="text-center text-[22px] font-bold text-[#F4F4F4]">
            {formatRate(stats.batting_average)}
          </p>
          <p className="mb-3 text-center text-xs text-[#A1A1AA]">
            {stats.at_bats} 打数 {stats.hits} 安打
          </p>
          <div className="flex justify-between gap-2">
            {chips.map((chip) => (
              <div
                key={chip.label}
                className="flex flex-1 flex-col items-center rounded-lg bg-[#424242] py-2"
              >
                <span className="text-[11px] text-[#A1A1AA]">{chip.label}</span>
                <span className="mt-0.5 text-base font-bold text-[#F4F4F4]">
                  {chip.value}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-5">
          <p className="mb-1 text-[13px] text-[#A1A1AA]">
            対象データがありません
          </p>
          <p className="text-center text-[11px] text-[#71717A]">
            新仕様で記録した試合（ランナー状況付き）が対象です
          </p>
        </div>
      )}
    </section>
  );
}
