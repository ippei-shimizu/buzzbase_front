"use client";

import type { RadarAxis } from "./radarChartUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Group } from "@visx/group";
import { Point } from "@visx/point";
import { scaleLinear } from "@visx/scale";
import { LineRadial } from "@visx/shape";

const LEVELS = 5; // 同心円の段数 (20, 40, 60, 80, 100)
const LABEL_MARGIN = 48; // ラベル表示用のマージン
const CHART_SIZE = 260;

const WEB_STROKE = "#3F3F46"; // zinc-700
const AXIS_STROKE = "#52525B"; // zinc-600

interface StatsRadarChartProps {
  data: RadarAxis[];
  color: string;
  title: string;
}

/** 角度(index) → ラジアン。12時方向を0度として時計回り */
function angleSlice(index: number, total: number): number {
  return (Math.PI * 2 * index) / total - Math.PI / 2;
}

/** 角度と半径から座標を計算 */
function pointOnCircle(angle: number, radius: number): Point {
  return new Point({
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  });
}

function RadarChart({ data, color, title }: StatsRadarChartProps) {
  const radius = (CHART_SIZE - LABEL_MARGIN * 2) / 2;
  const center = CHART_SIZE / 2;
  const total = data.length;

  const radiusScale = scaleLinear<number>({
    domain: [0, 100],
    range: [0, radius],
  });

  const levelValues = Array.from(
    { length: LEVELS },
    (_, i) => ((i + 1) / LEVELS) * 100,
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <h4 className="text-sm font-bold text-zinc-200">{title}</h4>
      <div
        className="relative"
        style={{ width: CHART_SIZE, height: CHART_SIZE }}
      >
        <svg
          width={CHART_SIZE}
          height={CHART_SIZE}
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          className="max-w-full h-auto"
        >
          <Group top={center} left={center}>
            {/* 同心円ウェブ */}
            {levelValues.map((level) => (
              <LineRadial
                key={`web-${level}`}
                data={Array.from({ length: total + 1 }, (_, i) => i)}
                angle={(i) => angleSlice(i % total, total) + Math.PI / 2}
                radius={() => radiusScale(level)}
                fill="none"
                stroke={WEB_STROKE}
                strokeWidth={1}
              />
            ))}

            {/* 軸線: 中心から各頂点 */}
            {data.map((_, i) => {
              const angle = angleSlice(i, total);
              const p = pointOnCircle(angle, radius);
              return (
                <line
                  key={`axis-${i}`}
                  x1={0}
                  y1={0}
                  x2={p.x}
                  y2={p.y}
                  stroke={AXIS_STROKE}
                  strokeWidth={1}
                />
              );
            })}

            {/* データポリゴン */}
            <polygon
              points={data
                .map((d, i) => {
                  const angle = angleSlice(i, total);
                  const r = radiusScale(d.value);
                  const p = pointOnCircle(angle, r);
                  return `${p.x},${p.y}`;
                })
                .join(" ")}
              fill={color}
              fillOpacity={0.25}
              stroke={color}
              strokeWidth={2}
            />

            {/* 頂点マーカー */}
            {data.map((d, i) => {
              const angle = angleSlice(i, total);
              const r = radiusScale(d.value);
              const p = pointOnCircle(angle, r);
              return (
                <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3} fill={color} />
              );
            })}
          </Group>
        </svg>

        {/* 軸ラベル（HTML overlay - Popover対応） */}
        {data.map((d, i) => {
          const angle = angleSlice(i, total);
          const labelRadius = radius + 24;
          const p = pointOnCircle(angle, labelRadius);

          const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
          let translateX = "-50%";
          let textAlign: "left" | "center" | "right" = "center";
          if (angleDeg > 20 && angleDeg < 160) {
            translateX = "0%";
            textAlign = "left";
          } else if (angleDeg > 200 && angleDeg < 340) {
            translateX = "-100%";
            textAlign = "right";
          }

          return (
            <Popover key={`label-${i}`} placement="top" showArrow>
              <PopoverTrigger>
                <button
                  type="button"
                  className="absolute leading-tight cursor-pointer decoration-zinc-600 decoration-dotted underline underline-offset-2 whitespace-nowrap"
                  style={{
                    left: center + p.x,
                    top: center + p.y,
                    transform: `translate(${translateX}, -50%)`,
                    textAlign,
                  }}
                >
                  <span className="text-xs font-semibold text-zinc-300 block">
                    {d.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {d.metric}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-w-[200px] p-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold">
                    {d.label}（{d.metric}）
                  </p>
                  <p className="text-sm font-bold" style={{ color }}>
                    {d.rawValue}
                  </p>
                  <p className="text-[10px] text-zinc-400">{d.description}</p>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}

export default function StatsRadarChart(props: StatsRadarChartProps) {
  if (props.data.length === 0) return null;
  return <RadarChart {...props} />;
}
