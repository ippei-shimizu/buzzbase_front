import type { ReactNode } from "react";

// モバイルアプリの components/pro/paywall/artPrimitives.tsx と同じ座標系・配色で描き、
// Web / アプリのオンボーディングの図の座標をそのまま対応させる。
const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 190;

export const BRAND = "#d08000";
export const CARD_BG = "#27272A";
export const CARD_EDGE = "#3F3F46";
export const BODY = "#3F3F46";
export const MUTED = "#52525B";
export const INK = "#F4F4F4";
export const SUB_INK = "#A1A1AA";
export const ON_BRAND_INK = "#2E2E2E";

export interface ConfettiItem {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}

/** 背景の飾り。スライドごとに配置と色を変えて、並べたときの印象を散らす。 */
export function Confetti({ items }: { items: readonly ConfettiItem[] }) {
  return (
    <g>
      {items.map((item) => (
        <circle
          key={`${item.cx}-${item.cy}`}
          cx={item.cx}
          cy={item.cy}
          r={item.r}
          fill={item.fill}
          opacity={item.opacity}
        />
      ))}
    </g>
  );
}

/** 四方に光る装飾。強調したい要素の周りに添えて特別に見せる。 */
export function Sparkle({
  x,
  y,
  size,
  color = BRAND,
}: {
  x: number;
  y: number;
  size: number;
  color?: string;
}) {
  const points = [
    `${x},${y - size}`,
    `${x + size * 0.26},${y - size * 0.26}`,
    `${x + size},${y}`,
    `${x + size * 0.26},${y + size * 0.26}`,
    `${x},${y + size}`,
    `${x - size * 0.26},${y + size * 0.26}`,
    `${x - size},${y}`,
    `${x - size * 0.26},${y - size * 0.26}`,
  ].join(" ");
  return <polygon points={points} fill={color} opacity={0.9} />;
}

interface CardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
}

/** 角丸のカード。傾けて重ねる用途が多いので g の transform と組み合わせて使う。 */
export function Card({ x, y, width, height, opacity = 1 }: CardProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={12}
      fill={CARD_BG}
      stroke={CARD_EDGE}
      strokeWidth={1.5}
      opacity={opacity}
    />
  );
}

/** 280x190 の座標系で図を描く SVG。表示幅いっぱいに縦横比を保って広がる。 */
export function ArtCanvas({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      fill="none"
      aria-hidden="true"
      className="h-full w-full overflow-hidden"
    >
      {children}
    </svg>
  );
}
