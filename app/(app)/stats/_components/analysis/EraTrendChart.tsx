"use client";
import type { EraTrendGranularity, EraTrendPoint } from "../../analysisActions";
import { Fragment, type ReactNode } from "react";
import { MAX_SEASON_X_LABELS, toSeasonAxisLabel } from "./trendAxis";

interface EraTrendChartProps {
  points: EraTrendPoint[];
  granularity: EraTrendGranularity;
  onGranularityChange: (granularity: EraTrendGranularity) => void;
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 140;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const GRANULARITY_OPTIONS: readonly {
  key: EraTrendGranularity;
  label: string;
}[] = [
  { key: "month", label: "月" },
  { key: "season", label: "シーズン" },
];

const GRANULARITY_NOTES: Record<EraTrendGranularity, string> = {
  month: "月ごとの防御率",
  season: "シーズンごとの防御率（シーズン跨ぎ比較）",
};

function GranularityToggle({
  value,
  onChange,
}: {
  value: EraTrendGranularity;
  onChange: (value: EraTrendGranularity) => void;
}) {
  return (
    <div className="flex rounded-md bg-[#27272A] p-0.5">
      {GRANULARITY_OPTIONS.map((option) => {
        const isActive = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
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

function ChartFrame({
  granularity,
  onGranularityChange,
  children,
}: {
  granularity: EraTrendGranularity;
  onGranularityChange: (granularity: EraTrendGranularity) => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">防御率推移</h3>
        <GranularityToggle value={granularity} onChange={onGranularityChange} />
      </div>
      {children}
    </section>
  );
}

/**
 * 防御率推移の折れ線グラフ（ERA をエリア塗りつぶし付きで描画）。
 * granularity 切替で 月 / シーズン を選べる。シーズン粒度は Pro 限定のため、
 * 選択可否の判定は onGranularityChange 側が担う。
 */
export function EraTrendChart({
  points,
  granularity,
  onGranularityChange,
}: EraTrendChartProps) {
  // 登板の無い期間などで era が null/Infinity でも安全に描けるよう有限値だけ残す。
  // 並び順は back の集計順（月昇順 / シーズン開始順）をそのまま使う。
  const drawablePoints = points.filter((point) => Number.isFinite(point.era));

  // データが無くても粒度トグルは出す。空になった粒度から戻れなくなるのを防ぐ。
  if (drawablePoints.length === 0) {
    return (
      <ChartFrame
        granularity={granularity}
        onGranularityChange={onGranularityChange}
      >
        <div className="flex flex-col items-center py-8">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            対象データなし
          </p>
          <p className="text-[11px] text-[#71717A]">
            登板を記録すると推移が表示されます
          </p>
        </div>
      </ChartFrame>
    );
  }

  const isSeason = granularity === "season";

  // Math.max(..., 1) で maxEra は常に 1 以上になる。
  const maxEra = Math.max(...drawablePoints.map((point) => point.era), 1);
  const yTicks = [0, Math.round((maxEra / 2) * 10) / 10, Math.ceil(maxEra)];

  const getX = (index: number) =>
    PADDING_LEFT +
    (drawablePoints.length === 1
      ? PLOT_WIDTH / 2
      : (index / (drawablePoints.length - 1)) * PLOT_WIDTH);
  const getY = (era: number) =>
    PADDING_TOP + PLOT_HEIGHT - (era / maxEra) * PLOT_HEIGHT;

  const linePath = drawablePoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)},${getY(point.era)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L ${getX(drawablePoints.length - 1)},${PADDING_TOP + PLOT_HEIGHT} L ${getX(0)},${PADDING_TOP + PLOT_HEIGHT} Z`;

  // シーズン名は長いため、月粒度より少ない本数に間引いて重なりを避ける。
  const labelStride = isSeason
    ? Math.max(1, Math.ceil(drawablePoints.length / MAX_SEASON_X_LABELS))
    : 1;
  // 値ラベル（era）も X 軸と同じ本数に間引く。シーズン数が増えると点の間隔が
  // 4 桁の数値より狭くなり、間引かないと隣と重なって読めなくなる。
  const isLabelVisible = (index: number) =>
    index % labelStride === 0 || index === drawablePoints.length - 1;

  return (
    <ChartFrame
      granularity={granularity}
      onGranularityChange={onGranularityChange}
    >
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

          {drawablePoints.map((point, index) => (
            <Fragment key={`pt-${point.key}`}>
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

          {drawablePoints.map((point, index) =>
            isLabelVisible(index) ? (
              <text
                key={`xl-${point.key}`}
                x={getX(index)}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fill="#A1A1AA"
                fontSize={10}
              >
                {isSeason ? toSeasonAxisLabel(point.label) : point.label}
              </text>
            ) : null,
          )}

          {drawablePoints.map((point, index) =>
            isLabelVisible(index) ? (
              <text
                key={`val-${point.key}`}
                x={getX(index)}
                // 最大値の点では getY が上端付近になりラベルが見切れるため下限を設ける。
                y={Math.max(getY(point.era) - 10, PADDING_TOP + 9)}
                textAnchor="middle"
                fill="#F4F4F4"
                fontSize={9}
                fontWeight={600}
              >
                {point.era.toFixed(2)}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <p className="mt-2 text-center text-[11px] text-[#71717A]">
        {GRANULARITY_NOTES[granularity]}
      </p>
    </ChartFrame>
  );
}
