import {
  ArtCanvas,
  BRAND,
  Card,
  Confetti,
  INK,
  MUTED,
  ON_BRAND_INK,
  Sparkle,
  SUB_INK,
} from "./artPrimitives";

const CHART = { left: 44, right: 222, top: 70, bottom: 150 } as const;
// yFor はクランプしないため、MONTHLY_AVERAGES がこの上下端を外れると折れ線がカードのヘッダーへ抜ける。
const AXIS_MIN_AVERAGE = 0.22;
const AXIS_MAX_AVERAGE = 0.34;
const AXIS_TICKS = [0.32, 0.28, 0.24] as const;

// シーズン粒度の推移は Pro 限定のため、無料で見られる月別の1系列だけを描く。
const MONTHLY_AVERAGES = [
  { month: "4月", average: 0.245 },
  { month: "5月", average: 0.262 },
  { month: "6月", average: 0.258 },
  { month: "7月", average: 0.291 },
  { month: "8月", average: 0.318 },
] as const;

const xFor = (index: number) =>
  CHART.left +
  12 +
  ((CHART.right - CHART.left - 24) / (MONTHLY_AVERAGES.length - 1)) * index;

const yFor = (average: number) =>
  CHART.bottom -
  ((average - AXIS_MIN_AVERAGE) / (AXIS_MAX_AVERAGE - AXIS_MIN_AVERAGE)) *
    (CHART.bottom - CHART.top);

/**
 * 「成長を1枚のグラフで」の図。
 * 構図: 端末を使わずグラフのカードを斜めに重ね、最新月の打率を吹き出しでカード外へ出す。
 */
export default function GrowthIllustration() {
  const points = MONTHLY_AVERAGES.map(
    ({ average }, index) => `${xFor(index)},${yFor(average).toFixed(1)}`,
  );
  const latestMonth = MONTHLY_AVERAGES[MONTHLY_AVERAGES.length - 1];
  const latestX = xFor(MONTHLY_AVERAGES.length - 1);
  const latestY = yFor(latestMonth.average);
  const areaPath = `M ${xFor(0)} ${CHART.bottom} L ${points.join(" L ")} L ${latestX} ${CHART.bottom} Z`;

  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 14, cy: 26, r: 8, fill: "#5B8DEF", opacity: 0.22 },
          { cx: 264, cy: 172, r: 9, fill: "#4F9E6B", opacity: 0.22 },
        ]}
      />

      <g transform="rotate(-5 145 95)">
        <Card x={40} y={20} width={210} height={146} opacity={0.55} />
      </g>
      <Card x={24} y={30} width={214} height={148} />

      <text x={38} y={50} fill={SUB_INK} fontSize={10}>
        打率の推移
      </text>
      <rect
        x={96}
        y={40}
        width={34}
        height={15}
        rx={7.5}
        fill="rgba(208, 128, 0, 0.18)"
      />
      <text
        x={113}
        y={51}
        fill={BRAND}
        fontSize={9}
        fontWeight="bold"
        textAnchor="middle"
      >
        月別
      </text>

      {AXIS_TICKS.map((tick) => (
        <line
          key={tick}
          x1={CHART.left}
          y1={yFor(tick)}
          x2={CHART.right}
          y2={yFor(tick)}
          stroke={MUTED}
          strokeWidth={1}
          opacity={0.55}
        />
      ))}

      <path d={areaPath} fill={BRAND} fillOpacity={0.15} />
      <polyline
        points={points.join(" ")}
        stroke={BRAND}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {MONTHLY_AVERAGES.map(({ month, average }, index) => (
        <g key={month}>
          <circle cx={xFor(index)} cy={yFor(average)} r={3.5} fill={BRAND} />
          <text
            x={xFor(index)}
            y={166}
            fill={SUB_INK}
            fontSize={8}
            textAnchor="middle"
          >
            {month}
          </text>
        </g>
      ))}
      <circle
        cx={latestX}
        cy={latestY}
        r={7}
        stroke={BRAND}
        strokeWidth={2}
        opacity={0.6}
      />

      <g>
        <rect x={180} y={10} width={76} height={36} rx={12} fill={BRAND} />
        <polygon
          points={`${latestX - 6},46 ${latestX + 6},46 ${latestX},53`}
          fill={BRAND}
        />
        <line
          x1={latestX}
          y1={53}
          x2={latestX}
          y2={latestY - 9}
          stroke={BRAND}
          strokeWidth={1.5}
          opacity={0.6}
        />
        <text x={190} y={25} fill={ON_BRAND_INK} fontSize={9} fontWeight="bold">
          {`${latestMonth.month}の打率`}
        </text>
        <text
          x={190}
          y={40}
          fill={ON_BRAND_INK}
          fontSize={14}
          fontWeight="bold"
        >
          {latestMonth.average.toFixed(3).replace(/^0/, "")}
        </text>
        <polygon points="236,40 242,29 248,40" fill={ON_BRAND_INK} />
      </g>
      <Sparkle x={266} y={58} size={6} />
      <Sparkle x={170} y={16} size={4} color={INK} />
    </ArtCanvas>
  );
}
