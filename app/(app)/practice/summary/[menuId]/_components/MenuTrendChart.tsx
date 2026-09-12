"use client";

import type { MenuTrend, MenuTrendBucket } from "@app/types/practice";
import { Fragment, useId, useState } from "react";
import {
  type TrendPeriod,
  bucketValue,
  bucketValueText,
  periodLabel,
} from "../_utils/menuTrendRange";

interface MenuTrendChartProps {
  trend: MenuTrend;
  period: TrendPeriod;
  /** 表示対象のバケット（新しい順）。内部で古い→新しいへ並べ替えて描画する。 */
  buckets: MenuTrendBucket[];
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 180;
const PADDING_LEFT = 34;
const PADDING_RIGHT = 12;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const PLOT_RIGHT = CHART_WIDTH - PADDING_RIGHT;
const PLOT_BOTTOM = PADDING_TOP + PLOT_HEIGHT;

// X 軸ラベルは混雑回避のため間引く。日別の全期間（最大60件）でも読める本数にする。
const MAX_X_LABELS = 6;

const LINE_COLOR = "#d08000";

/** Y 軸の目盛り。1万以上は k 表記にして軸幅に収める。 */
const axisLabel = (value: number): string =>
  value >= 10_000
    ? `${Math.round(value / 1000).toLocaleString("ja-JP")}k`
    : Math.round(value).toLocaleString("ja-JP");

/**
 * メニューの積み上げ推移の折れ線グラフ（グラデーションの面付き）。
 * 点をクリックすると値と期間のツールチップを出す（成績の推移グラフと同じ操作感）。
 */
export default function MenuTrendChart({
  trend,
  period,
  buckets,
}: MenuTrendChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gradientId = useId();

  // 古い→新しいで描き、最新を右端に置く。
  const shown = [...buckets].reverse();
  if (shown.length === 0) return null;

  const values = shown.map((bucket) => bucketValue(trend, bucket));
  const max = Math.max(...values, 1);
  const yTicks = [0, max];

  const getX = (index: number) =>
    PADDING_LEFT +
    (shown.length === 1
      ? PLOT_WIDTH / 2
      : (index / (shown.length - 1)) * PLOT_WIDTH);
  const getY = (value: number) =>
    PADDING_TOP + PLOT_HEIGHT - (value / max) * PLOT_HEIGHT;

  // タップ領域の縦帯。隣接点との X 中点で分割し、両端はプロット境界にクランプする。
  const getBandX = (index: number) =>
    index === 0 ? PADDING_LEFT : (getX(index - 1) + getX(index)) / 2;
  const getBandRight = (index: number) =>
    index === shown.length - 1
      ? PLOT_RIGHT
      : (getX(index) + getX(index + 1)) / 2;

  const linePath = values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)},${getY(value)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L ${getX(shown.length - 1)},${PLOT_BOTTOM} L ${getX(0)},${PLOT_BOTTOM} Z`;

  const labelStride = Math.max(1, Math.ceil(shown.length / MAX_X_LABELS));

  return (
    <div className="flex justify-center">
      <svg
        width="100%"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="max-w-[460px]"
        role="img"
        aria-label="積み上げの推移グラフ"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.28} />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* 余白のクリックでツールチップを閉じる。点の帯は後から描くので前面に来る。 */}
        <rect
          x={0}
          y={0}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          fill="transparent"
          onClick={() => setSelectedIndex(null)}
        />

        {yTicks.map((tick) => (
          <Fragment key={`y-${tick}`}>
            <line
              x1={PADDING_LEFT}
              y1={getY(tick)}
              x2={PLOT_RIGHT}
              y2={getY(tick)}
              stroke="#424242"
              strokeWidth={0.5}
            />
            <text
              x={PADDING_LEFT - 5}
              y={getY(tick) + 3}
              textAnchor="end"
              fill="#71717A"
              fontSize={9}
            >
              {axisLabel(tick)}
            </text>
          </Fragment>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {shown.map((bucket, index) => {
          const isSelected = selectedIndex === index;
          const bandX = getBandX(index);
          const bandY = Math.max(PADDING_TOP, getY(values[index]) - 8);
          return (
            <Fragment key={`pt-${bucket.period}`}>
              <rect
                x={bandX}
                y={bandY}
                width={getBandRight(index) - bandX}
                height={PLOT_BOTTOM - bandY}
                fill="transparent"
                className="cursor-pointer"
                onClick={() =>
                  setSelectedIndex((prev) => (prev === index ? null : index))
                }
              />
              <circle
                cx={getX(index)}
                cy={getY(values[index])}
                r={isSelected ? 4 : 2.4}
                fill={LINE_COLOR}
                stroke={isSelected ? "#F4F4F4" : "none"}
                strokeWidth={isSelected ? 1.5 : 0}
              />
            </Fragment>
          );
        })}

        {selectedIndex !== null
          ? (() => {
              const bucket = shown[selectedIndex];
              if (!bucket) return null;
              const valueText = bucketValueText(trend, bucket);
              const labelText = periodLabel(period, bucket.period);
              const cx = getX(selectedIndex);
              const cy = getY(values[selectedIndex]);
              const tooltipWidth = Math.max(
                64,
                valueText.length * 8 + 20,
                labelText.length * 7 + 20,
              );
              const tooltipHeight = 32;
              // 端で見切れないよう位置を寄せる。
              let tx = cx - tooltipWidth / 2;
              if (tx < 2) tx = 2;
              if (tx + tooltipWidth > CHART_WIDTH - 2)
                tx = CHART_WIDTH - tooltipWidth - 2;
              let ty = cy - tooltipHeight - 8;
              if (ty < 2) ty = cy + 10;
              return (
                <g>
                  <rect
                    x={tx}
                    y={ty}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx={5}
                    fill="#27272A"
                    stroke={LINE_COLOR}
                    strokeWidth={1}
                  />
                  <text
                    x={tx + tooltipWidth / 2}
                    y={ty + 13}
                    textAnchor="middle"
                    fill="#F4F4F4"
                    fontSize={11}
                    fontWeight={700}
                  >
                    {valueText}
                  </text>
                  <text
                    x={tx + tooltipWidth / 2}
                    y={ty + 25}
                    textAnchor="middle"
                    fill="#A1A1AA"
                    fontSize={9}
                  >
                    {labelText}
                  </text>
                </g>
              );
            })()
          : null}

        {shown.map((bucket, index) =>
          index % labelStride === 0 || index === shown.length - 1 ? (
            <text
              key={`xl-${bucket.period}`}
              x={getX(index)}
              y={CHART_HEIGHT - 5}
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize={9}
            >
              {periodLabel(period, bucket.period)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
