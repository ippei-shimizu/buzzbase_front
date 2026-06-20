"use client";
import type { BreakdownCategory } from "../../analysisActions";

interface BreakdownBarsProps {
  breakdown: BreakdownCategory[];
}

/** 割合つきの横棒リスト（球質 / タイミング / アウト種別などの内訳表示）。 */
export function BreakdownBars({ breakdown }: BreakdownBarsProps) {
  if (breakdown.length === 0) {
    return <p className="text-sm text-zinc-500">データがありません。</p>;
  }
  return (
    <div className="flex flex-col gap-y-2">
      {breakdown.map((category) => {
        const label = category.label ?? category.category ?? "";
        return (
          <div key={label} className="flex flex-col gap-y-1">
            <div className="flex justify-between text-xs">
              <span>{label}</span>
              <span className="text-zinc-400">
                {category.count}件 ({Math.round(category.percentage)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, category.percentage)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
