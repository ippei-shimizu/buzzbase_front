"use client";
import type { BattingTrendData } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface BattingTrendChartProps {
  data: BattingTrendData;
}

const WIDTH = 320;
const HEIGHT = 140;
const PADDING = 24;

/** OPS の推移を折れ線で表示するシンプルな SVG チャート。 */
export function BattingTrendChart({ data }: BattingTrendChartProps) {
  const points = data.points;
  if (points.length === 0) {
    return (
      <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
        <h3 className="text-sm font-bold">打撃推移（OPS）</h3>
        <p className="text-sm text-zinc-500">対象データがありません。</p>
      </section>
    );
  }

  const values = points.map((point) => point.ops);
  const maxValue = Math.max(...values, 0.001);
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = PADDING + stepX * index;
    const y = PADDING + innerHeight * (1 - point.ops / maxValue);
    return { x, y };
  });
  const polyline = coords.map((coord) => `${coord.x},${coord.y}`).join(" ");

  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
      <h3 className="text-sm font-bold">打撃推移（OPS）</h3>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="max-w-full h-auto"
      >
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="rgba(255,255,255,0.2)"
        />
        {coords.length > 1 ? (
          <polyline
            points={polyline}
            fill="none"
            stroke="#d08000"
            strokeWidth={2}
          />
        ) : null}
        {coords.map((coord, index) => (
          <circle
            key={points[index].key}
            cx={coord.x}
            cy={coord.y}
            r={3}
            fill="#d08000"
          />
        ))}
      </svg>
      <p className="text-xs text-zinc-400 text-right">
        最新: {formatRate(points[points.length - 1].ops)}
      </p>
    </section>
  );
}
