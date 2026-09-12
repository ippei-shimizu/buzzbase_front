"use client";

import type { MonthlyGame } from "../../gameSummaryTypes";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from "recharts";

interface MonthlyGameChartProps {
  games: MonthlyGame[];
}

/** 月別試合数の棒グラフ。試合数に応じて棒の不透明度を変える（mobile と同じ見せ方）。 */
export function MonthlyGameChart({ games }: MonthlyGameChartProps) {
  if (games.length === 0) return null;

  const maxCount = Math.max(...games.map((game) => game.count), 1);

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">月別試合数</h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={games}
          margin={{ top: 16, right: 8, bottom: 0, left: 8 }}
        >
          <XAxis
            dataKey="month"
            tickFormatter={(month: number) => `${month}月`}
            tick={{ fill: "#71717A", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {games.map((game) => (
              <Cell
                key={game.month}
                fill="#d08000"
                fillOpacity={0.5 + (game.count / maxCount) * 0.5}
              />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              fill="#A1A1AA"
              fontSize={9}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
