import {
  ArtCanvas,
  BODY,
  BRAND,
  Card,
  CARD_BG,
  Confetti,
  INK,
  MUTED,
  ON_BRAND_INK,
  Sparkle,
  SUB_INK,
} from "./artPrimitives";

const PODIUM_BOTTOM = 184;
const PODIUM_WIDTH = 62;

// 表彰台の見た目と対応させるため、順位順ではなく左からの配置順で持つ。
const PODIUMS = [
  { rank: 2, x: 46, top: 110, average: ".365", avatarRadius: 17 },
  { rank: 1, x: 109, top: 90, average: ".412", avatarRadius: 21 },
  { rank: 3, x: 172, top: 124, average: ".340", avatarRadius: 17 },
] as const;

function Avatar({
  cx,
  cy,
  r,
  isLeader,
}: {
  cx: number;
  cy: number;
  r: number;
  isLeader: boolean;
}) {
  const shoulderBottom = cy + r * 0.62;
  const shoulderHalfWidth = r * 0.55;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={BODY}
        stroke={isLeader ? BRAND : MUTED}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy - r * 0.2} r={r * 0.32} fill={SUB_INK} />
      <path
        d={`M ${cx - shoulderHalfWidth} ${shoulderBottom} A ${shoulderHalfWidth} ${r * 0.45} 0 0 1 ${cx + shoulderHalfWidth} ${shoulderBottom} Z`}
        fill={SUB_INK}
      />
    </g>
  );
}

/**
 * 「チームメイトとランキングで競う」の図。
 * 構図: 端末を使わず表彰台を正面から描き、1位の頭上に王冠を置く。
 */
export default function RankingIllustration() {
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 30, cy: 70, r: 6, fill: "#5B8DEF", opacity: 0.3 },
          { cx: 252, cy: 58, r: 8, fill: "#4F9E6B", opacity: 0.28 },
          { cx: 248, cy: 150, r: 5, fill: BRAND, opacity: 0.3 },
          { cx: 20, cy: 150, r: 9, fill: "#E26D5C", opacity: 0.2 },
        ]}
      />

      <rect
        x={14}
        y={14}
        width={80}
        height={22}
        rx={11}
        fill={CARD_BG}
        stroke={BRAND}
        strokeWidth={1.2}
      />
      <text
        x={54}
        y={29}
        fill={INK}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
      >
        打率ランキング
      </text>

      {PODIUMS.map((podium) => {
        const isLeader = podium.rank === 1;
        const centerX = podium.x + PODIUM_WIDTH / 2;
        return (
          <g key={podium.rank}>
            {isLeader ? (
              <rect
                x={podium.x}
                y={podium.top}
                width={PODIUM_WIDTH}
                height={PODIUM_BOTTOM - podium.top}
                rx={12}
                fill={BRAND}
              />
            ) : (
              <Card
                x={podium.x}
                y={podium.top}
                width={PODIUM_WIDTH}
                height={PODIUM_BOTTOM - podium.top}
              />
            )}
            <text
              x={centerX}
              y={podium.top + 26}
              fill={isLeader ? ON_BRAND_INK : INK}
              fontSize={22}
              fontWeight="bold"
              textAnchor="middle"
            >
              {podium.rank}
            </text>
            <text
              x={centerX}
              y={podium.top + 44}
              fill={isLeader ? ON_BRAND_INK : SUB_INK}
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
            >
              {podium.average}
            </text>
            <Avatar
              cx={centerX}
              cy={podium.top - podium.avatarRadius - 5}
              r={podium.avatarRadius}
              isLeader={isLeader}
            />
          </g>
        );
      })}

      <path
        d="M126 42 L128 28 L135 35 L140 24 L145 35 L152 28 L154 42 Z"
        fill={BRAND}
      />
      <Sparkle x={112} y={30} size={6} />
      <Sparkle x={170} y={24} size={8} />
    </ArtCanvas>
  );
}
