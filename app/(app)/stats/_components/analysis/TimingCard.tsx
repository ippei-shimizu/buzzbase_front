"use client";
import type { TimingBreakdownCategory } from "../../analysisActions";

interface TimingCardProps {
  breakdown: TimingBreakdownCategory[];
  total: number;
}

// timings マスタの 3 種それぞれにユニークな色。
const COLORS: Record<string, string> = {
  ドンピシャ: "#17C964",
  泳ぎ気味: "#d08000",
  遅れ気味: "#71717A",
};

const SIZE = 148;
const STROKE_WIDTH = 12;
const GAP = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** タイミング別の打席比率（ドンピシャ/泳ぎ気味/遅れ気味）の内訳ドーナツ + 横棒凡例。 */
export function TimingCard({ breakdown, total }: TimingCardProps) {
  if (total === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">タイミング</h3>
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

  const activeSegments = breakdown.filter((category) => category.count > 0);
  const gapTotal = activeSegments.length > 1 ? activeSegments.length * GAP : 0;
  const availableCircumference = CIRCUMFERENCE - gapTotal;
  const dashLengths = activeSegments.map(
    (category) => (category.percentage / 100) * availableCircumference,
  );
  const segments = activeSegments.map((category, index) => {
    const dashLength = dashLengths[index];
    const dashGap = CIRCUMFERENCE - dashLength;
    const accumulatedOffset = dashLengths
      .slice(0, index)
      .reduce((sum, length) => sum + length + GAP, 0);
    const offset = -accumulatedOffset + CIRCUMFERENCE * 0.25;
    return {
      ...category,
      dashArray: `${dashLength} ${dashGap}`,
      dashOffset: offset,
      color: COLORS[category.label] || "#71717A",
    };
  });

  const maxPercentage = Math.max(
    ...breakdown.map((category) => category.percentage),
    1,
  );

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">タイミング</h3>
        <span className="text-[11px] text-[#A1A1AA]">対象 {total} 打席</span>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center justify-center">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#27272a"
              strokeWidth={STROKE_WIDTH}
            />
            {segments.map((segment) => (
              <circle
                key={segment.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="round"
              />
            ))}
            <text
              x={SIZE / 2}
              y={SIZE / 2 - 2}
              textAnchor="middle"
              fill="#F4F4F4"
              fontSize={26}
              fontWeight={800}
            >
              {total}
            </text>
            <text
              x={SIZE / 2}
              y={SIZE / 2 + 16}
              textAnchor="middle"
              fill="#71717A"
              fontSize={11}
              fontWeight={500}
            >
              打席
            </text>
          </svg>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1.5">
          {breakdown.map((category) => {
            const color = COLORS[category.label] || "#71717A";
            const barWidth =
              maxPercentage > 0
                ? (category.percentage / maxPercentage) * 100
                : 0;
            return (
              <div key={category.id} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] font-semibold text-[#A1A1AA]">
                      {category.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: category.count > 0 ? "#F4F4F4" : "#52525B",
                    }}
                  >
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-sm bg-[#27272a]">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: color,
                      opacity: category.count > 0 ? 1 : 0.2,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
