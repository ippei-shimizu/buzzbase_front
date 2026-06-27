"use client";
import type { PlateAppearanceCategory } from "../../analysisActions";

interface PlateAppearanceDonutProps {
  breakdown: PlateAppearanceCategory[];
  totalPlateAppearances: number;
}

const COLORS: Record<string, string> = {
  単打: "#f31260",
  長打: "#F54180",
  本塁打: "#FAA0BF",
  ゴロ: "#71717A",
  フライ: "#9CA3AF",
  三振: "#d08000",
  四死球: "#17C964",
  その他: "#8b5cf6",
};

const SIZE = 148;
const STROKE_WIDTH = 12;
const GAP = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * 打席結果の内訳ドーナツ。中央に総打席数、右に横棒で各カテゴリの比率を表示する。
 * セグメントは strokeDasharray / strokeDashoffset で円弧を描き、12時起点で並べる。
 */
export function PlateAppearanceDonut({
  breakdown,
  totalPlateAppearances,
}: PlateAppearanceDonutProps) {
  const activeSegments = breakdown.filter((category) => category.count > 0);
  const gapTotal = activeSegments.length > 1 ? activeSegments.length * GAP : 0;
  const availableCircumference = CIRCUMFERENCE - gapTotal;

  const dashLengths = activeSegments.map(
    (category) => (category.percentage / 100) * availableCircumference,
  );
  const segments = activeSegments.map((category, index) => {
    const dashLength = dashLengths[index];
    const dashGap = CIRCUMFERENCE - dashLength;
    // 直前までのセグメント長（GAP 込み）の累積を 12 時起点からのオフセットにする。
    const accumulatedOffset = dashLengths
      .slice(0, index)
      .reduce((sum, length) => sum + length + GAP, 0);
    const offset = -accumulatedOffset + CIRCUMFERENCE * 0.25;
    return {
      ...category,
      dashArray: `${dashLength} ${dashGap}`,
      dashOffset: offset,
      color: COLORS[category.category] || "#71717A",
    };
  });

  const maxPercentage = Math.max(
    ...breakdown.map((category) => category.percentage),
    1,
  );

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <h3 className="mb-4 text-base font-bold text-[#F4F4F4]">
        打席結果の内訳
      </h3>

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
                key={segment.category}
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
              {totalPlateAppearances}
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
            const color = COLORS[category.category] || "#71717A";
            const barWidth =
              maxPercentage > 0
                ? (category.percentage / maxPercentage) * 100
                : 0;
            return (
              <div key={category.category} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] font-semibold text-[#A1A1AA]">
                      {category.category}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: category.count > 0 ? "#F4F4F4" : "#52525B",
                    }}
                  >
                    {category.percentage}%
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
