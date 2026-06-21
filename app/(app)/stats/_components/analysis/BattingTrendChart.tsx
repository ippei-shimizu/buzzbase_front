"use client";
import type {
  BattingTrendGranularity,
  BattingTrendPoint,
} from "../../analysisActions";
import { Fragment, useEffect, useState } from "react";

interface BattingTrendChartProps {
  points: BattingTrendPoint[];
  granularity: BattingTrendGranularity;
  onGranularityChange: (granularity: BattingTrendGranularity) => void;
}

type LineKey =
  | "batting_average"
  | "on_base_percentage"
  | "slugging_percentage"
  | "ops";

interface LineConfig {
  key: LineKey;
  label: string;
  color: string;
}

const LINES: readonly LineConfig[] = [
  { key: "batting_average", label: "打率", color: "#d08000" },
  { key: "on_base_percentage", label: "出塁率", color: "#17C964" },
  { key: "slugging_percentage", label: "長打率", color: "#f31260" },
  { key: "ops", label: "OPS", color: "#8b5cf6" },
] as const;

const CHART_WIDTH = 320;
const CHART_HEIGHT = 180;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// X 軸ラベルは混雑回避のため最大 6 本に間引く。
const MAX_X_LABELS = 6;

const GRANULARITY_OPTIONS: readonly {
  key: BattingTrendGranularity;
  label: string;
}[] = [
  { key: "game", label: "試合" },
  { key: "month", label: "月" },
  { key: "year", label: "年" },
  { key: "recent_games", label: "直近10" },
];

const formatRate = (value: number): string =>
  value.toFixed(3).replace(/^0\./, ".");

function GranularityToggle({
  value,
  onChange,
}: {
  value: BattingTrendGranularity;
  onChange: (value: BattingTrendGranularity) => void;
}) {
  return (
    <div className="flex rounded-md bg-[#27272A] p-0.5">
      {GRANULARITY_OPTIONS.map((option) => {
        const isActive = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded px-2 py-1 text-[11px] font-semibold ${
              isActive ? "bg-[#52525B] text-[#F4F4F4]" : "text-[#A1A1AA]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 打撃成績の推移グラフ（4 ライン: 打率 / 出塁率 / 長打率 / OPS）。
 * granularity 切替で 試合 / 月 / 年 / 直近10 を選べる。初期表示は打率のみで、
 * 絞り込みから他指標を重ねられる。
 */
export function BattingTrendChart({
  points,
  granularity,
  onGranularityChange,
}: BattingTrendChartProps) {
  const [activeLines, setActiveLines] = useState<Set<LineKey>>(
    () => new Set<LineKey>(["batting_average"]),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDot, setSelectedDot] = useState<{
    lineKey: LineKey;
    pointIndex: number;
  } | null>(null);

  // points 差し替え（フィルタ/粒度変更）時に古い pointIndex のハイライトが残らないようリセットする。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDot(null);
  }, [points]);

  const allActive = activeLines.size === LINES.length;
  const filterLabel = (() => {
    if (allActive) return "全て";
    if (activeLines.size === 0) return "なし";
    if (activeLines.size === 1) {
      const onlyKey = Array.from(activeLines)[0];
      return LINES.find((line) => line.key === onlyKey)?.label ?? "全て";
    }
    return `${activeLines.size} 件選択`;
  })();

  const toggleLine = (key: LineKey) =>
    setActiveLines((prev) => {
      const next = new Set<LineKey>(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const selectAll = () =>
    setActiveLines(new Set<LineKey>(LINES.map((line) => line.key)));

  const handleDotPress = (lineKey: LineKey, pointIndex: number) =>
    setSelectedDot((prev) =>
      prev?.lineKey === lineKey && prev?.pointIndex === pointIndex
        ? null
        : { lineKey, pointIndex },
    );

  const handleGranularityChange = (next: BattingTrendGranularity) => {
    setSelectedDot(null);
    onGranularityChange(next);
  };

  if (points.length === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F4F4F4]">打撃成績の推移</h3>
          <GranularityToggle
            value={granularity}
            onChange={handleGranularityChange}
          />
        </div>
        <div className="flex flex-col items-center py-8">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            対象データなし
          </p>
          <p className="text-[11px] text-[#71717A]">
            試合を記録すると推移が表示されます
          </p>
        </div>
      </section>
    );
  }

  const visibleLines = LINES.filter((line) => activeLines.has(line.key));

  // 可視ラインの最大値から Y 軸スケールを決定。打率のみなら打率帯にズームし、
  // OPS を含めれば自然と 1.0+ までスケールが広がる。空なら汎用 0〜0.5。
  const valuesForScale =
    visibleLines.length > 0
      ? points.flatMap((point) => visibleLines.map((line) => point[line.key]))
      : [0.5];
  const rawMax = Math.max(...valuesForScale, 0.1);
  const maxValue = Math.max(rawMax * 1.1, 0.1);
  const valueRange = maxValue || 1;
  const yTicks = [0, maxValue / 3, (maxValue / 3) * 2, maxValue];

  const getX = (index: number) =>
    PADDING_LEFT +
    (points.length === 1
      ? PLOT_WIDTH / 2
      : (index / (points.length - 1)) * PLOT_WIDTH);
  const getY = (value: number) =>
    PADDING_TOP + PLOT_HEIGHT - (value / valueRange) * PLOT_HEIGHT;

  const linePaths = visibleLines.map((line) => ({
    ...line,
    d: points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${getX(index)},${getY(point[line.key])}`,
      )
      .join(" "),
  }));

  const labelStride = Math.max(1, Math.ceil(points.length / MAX_X_LABELS));

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">打撃成績の推移</h3>
        <GranularityToggle
          value={granularity}
          onChange={handleGranularityChange}
        />
      </div>

      <div className="relative z-10 mb-2 mt-1.5 flex justify-end">
        <button
          type="button"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className="flex items-center gap-1 rounded-full border border-[#71717b] px-3 py-1.5"
        >
          <span className="text-xs font-medium text-[#F4F4F4]">
            絞り込み: {filterLabel}
          </span>
          <ChevronIcon open={isFilterOpen} />
        </button>
        {isFilterOpen ? (
          <>
            <button
              type="button"
              aria-label="絞り込みを閉じる"
              className="fixed inset-0 z-[15] cursor-default"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="absolute right-0 top-9 z-20 min-w-[180px] rounded-lg bg-[#3A3A3A] py-1 shadow-lg">
              <button
                type="button"
                onClick={selectAll}
                className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left ${
                  allActive ? "bg-[#4A4A4A]" : ""
                }`}
              >
                <span
                  className={`flex-1 text-[13px] ${
                    allActive
                      ? "font-semibold text-[#d08000]"
                      : "text-[#F4F4F4]"
                  }`}
                >
                  全て表示
                </span>
              </button>
              {LINES.map((line) => {
                const isActive = activeLines.has(line.key);
                return (
                  <button
                    key={line.key}
                    type="button"
                    onClick={() => toggleLine(line.key)}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    <span
                      className={`flex-1 text-[13px] ${
                        isActive
                          ? "font-semibold text-[#d08000]"
                          : "text-[#F4F4F4]"
                      }`}
                    >
                      {line.label}
                    </span>
                    {isActive ? (
                      <span className="text-sm font-bold text-[#d08000]">
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex justify-center">
        <svg
          width="100%"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="max-w-[420px]"
        >
          <rect
            x={0}
            y={0}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            fill="transparent"
            onClick={() => setSelectedDot(null)}
          />
          {yTicks.map((tick) => (
            <Fragment key={`y-${tick.toFixed(3)}`}>
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
                fontSize={9}
              >
                {formatRate(tick)}
              </text>
            </Fragment>
          ))}

          {linePaths.map((line) => (
            <path
              key={line.key}
              d={line.d}
              fill="none"
              stroke={line.color}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {visibleLines.map((line) =>
            points.map((point, index) => {
              const isSelected =
                selectedDot?.lineKey === line.key &&
                selectedDot?.pointIndex === index;
              return (
                <Fragment key={`pt-${line.key}-${index}`}>
                  <circle
                    cx={getX(index)}
                    cy={getY(point[line.key])}
                    r={10}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => handleDotPress(line.key, index)}
                  />
                  <circle
                    cx={getX(index)}
                    cy={getY(point[line.key])}
                    r={isSelected ? 4 : 2.2}
                    fill={line.color}
                    stroke={isSelected ? "#F4F4F4" : "none"}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />
                </Fragment>
              );
            }),
          )}

          {selectedDot
            ? (() => {
                const point = points[selectedDot.pointIndex];
                const line = LINES.find(
                  (item) => item.key === selectedDot.lineKey,
                );
                if (!point || !line) return null;
                const value = point[selectedDot.lineKey];
                const cx = getX(selectedDot.pointIndex);
                const cy = getY(value);
                const tooltipWidth = 92;
                const tooltipHeight = 34;
                let tx = cx - tooltipWidth / 2;
                if (tx < 2) tx = 2;
                if (tx + tooltipWidth > CHART_WIDTH - 2)
                  tx = CHART_WIDTH - tooltipWidth - 2;
                let ty = cy - tooltipHeight - 8;
                if (ty < 2) ty = cy + 10;
                if (ty + tooltipHeight > CHART_HEIGHT - 2)
                  ty = CHART_HEIGHT - tooltipHeight - 2;
                return (
                  <g>
                    <rect
                      x={tx}
                      y={ty}
                      width={tooltipWidth}
                      height={tooltipHeight}
                      rx={5}
                      fill="#27272A"
                      stroke={line.color}
                      strokeWidth={1}
                    />
                    <text
                      x={tx + tooltipWidth / 2}
                      y={ty + 14}
                      textAnchor="middle"
                      fill="#F4F4F4"
                      fontSize={11}
                      fontWeight={700}
                    >
                      {`${line.label} ${formatRate(value)}`}
                    </text>
                    <text
                      x={tx + tooltipWidth / 2}
                      y={ty + 27}
                      textAnchor="middle"
                      fill="#A1A1AA"
                      fontSize={9}
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })()
            : null}

          {points.map((point, index) => {
            if (index % labelStride !== 0 && index !== points.length - 1)
              return null;
            return (
              <text
                key={`xl-${index}`}
                x={getX(index)}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fill="#A1A1AA"
                fontSize={9}
              >
                {point.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {LINES.map((line) => {
          const isActive = activeLines.has(line.key);
          return (
            <div key={line.key} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: line.color,
                  opacity: isActive ? 1 : 0.3,
                }}
              />
              <span
                className={`text-[11px] ${
                  isActive ? "text-[#A1A1AA]" : "text-[#52525B] line-through"
                }`}
              >
                {line.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A1A1AA"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={open ? "rotate-180" : ""}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
