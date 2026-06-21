"use client";
import type { EraTrendPoint } from "../../analysisActions";
import { Fragment } from "react";

interface EraTrendChartProps {
  data: EraTrendPoint[];
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 140;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

/** 防御率推移の折れ線グラフ（月別 ERA をエリア塗りつぶし付きで描画）。 */
export function EraTrendChart({ data }: EraTrendChartProps) {
  if (data.length === 0) return null;

  const maxEra = Math.max(...data.map((point) => point.era), 1);
  const eraRange = maxEra || 1;
  const yTicks = [0, Math.round((maxEra / 2) * 10) / 10, Math.ceil(maxEra)];

  const getX = (index: number) =>
    PADDING_LEFT +
    (data.length === 1
      ? PLOT_WIDTH / 2
      : (index / (data.length - 1)) * PLOT_WIDTH);
  const getY = (era: number) =>
    PADDING_TOP + PLOT_HEIGHT - (era / eraRange) * PLOT_HEIGHT;

  const linePath = data
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)},${getY(point.era)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L ${getX(data.length - 1)},${PADDING_TOP + PLOT_HEIGHT} L ${getX(0)},${PADDING_TOP + PLOT_HEIGHT} Z`;

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">防御率推移</h3>
      <div className="flex justify-center">
        <svg
          width="100%"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="max-w-[400px]"
        >
          <defs>
            <linearGradient id="eraAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#006fee" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#006fee" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <Fragment key={`y-${tick}`}>
              <line
                x1={PADDING_LEFT}
                y1={getY(tick)}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y2={getY(tick)}
                stroke="#424242"
                strokeWidth={0.5}
              />
              <text
                x={PADDING_LEFT - 6}
                y={getY(tick) + 3}
                textAnchor="end"
                fill="#71717A"
                fontSize={10}
              >
                {tick.toFixed(1)}
              </text>
            </Fragment>
          ))}

          <path d={areaPath} fill="url(#eraAreaGrad)" />

          <path
            d={linePath}
            fill="none"
            stroke="#006fee"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((point, index) => (
            <Fragment key={`pt-${point.month}`}>
              <circle
                cx={getX(index)}
                cy={getY(point.era)}
                r={4}
                fill="#006fee"
              />
              <circle
                cx={getX(index)}
                cy={getY(point.era)}
                r={2}
                fill="#F4F4F4"
              />
            </Fragment>
          ))}

          {data.map((point, index) => (
            <text
              key={`xl-${point.month}`}
              x={getX(index)}
              y={CHART_HEIGHT - 4}
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize={10}
            >
              {point.month}月
            </text>
          ))}

          {data.map((point, index) => (
            <text
              key={`val-${point.month}`}
              x={getX(index)}
              y={getY(point.era) - 10}
              textAnchor="middle"
              fill="#F4F4F4"
              fontSize={9}
              fontWeight={600}
            >
              {point.era.toFixed(2)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
