import { type ReactNode, useId } from "react";
import {
  ArtCanvas,
  BODY,
  BRAND,
  BRAND_SOFT,
  Card,
  CARD_BG,
  Confetti,
  INK,
  MUTED,
  ON_BRAND_INK,
  Sparkle,
  SUB_INK,
} from "./artPrimitives";

// 下端をキャンバスの外に出し、画面の続きがあるように見せる。
const PHONE = { x: 22, y: 14, width: 132, height: 246 } as const;

const PLATE_APPEARANCES = [
  { label: "1打席", result: "右安", isHit: true },
  { label: "2打席", result: "四球", isHit: false },
  { label: "3打席", result: "左二", isHit: true },
  { label: "4打席", result: "三振", isHit: false },
] as const;

const METRICS = [
  {
    label: "今季 打率",
    value: ".333",
    y: 22,
    rotate: -4,
    isHighlighted: false,
  },
  { label: "今季 OPS", value: ".900", y: 72, rotate: 0, isHighlighted: true },
  {
    label: "今季 防御率",
    value: "2.50",
    y: 122,
    rotate: 3,
    isHighlighted: false,
  },
] as const;

const METRIC_CARD = { x: 176, width: 94, height: 44 } as const;

/** ベゼル・ダイナミックアイランド・サイドボタンまで描いた端末。画面の中身は画面外へはみ出さないようクリップする。 */
function PhoneMock({ children }: { children: ReactNode }) {
  const screenClipId = useId();
  const { x, y, width, height } = PHONE;
  const bodyRadius = width * 0.19;
  const bezel = width * 0.045;
  const screenX = x + bezel;
  const screenY = y + bezel;
  const screenWidth = width - bezel * 2;
  const screenHeight = height - bezel * 2;
  const islandWidth = width * 0.3;
  const islandHeight = width * 0.075;
  const buttonWidth = Math.max(1.6, width * 0.02);
  return (
    <g>
      <rect
        x={x - buttonWidth}
        y={y + height * 0.2}
        width={buttonWidth * 2}
        height={height * 0.05}
        rx={buttonWidth}
        fill={MUTED}
      />
      <rect
        x={x - buttonWidth}
        y={y + height * 0.29}
        width={buttonWidth * 2}
        height={height * 0.08}
        rx={buttonWidth}
        fill={MUTED}
      />
      <rect
        x={x + width - buttonWidth}
        y={y + height * 0.26}
        width={buttonWidth * 2}
        height={height * 0.1}
        rx={buttonWidth}
        fill={MUTED}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={bodyRadius}
        fill={BODY}
        stroke={MUTED}
        strokeWidth={1.2}
      />
      <defs>
        <clipPath id={screenClipId}>
          <rect
            x={screenX}
            y={screenY}
            width={screenWidth}
            height={screenHeight}
            rx={bodyRadius - bezel}
          />
        </clipPath>
      </defs>
      <rect
        x={screenX}
        y={screenY}
        width={screenWidth}
        height={screenHeight}
        rx={bodyRadius - bezel}
        fill="#1B1B1E"
      />
      <g clipPath={`url(#${screenClipId})`}>{children}</g>
      <rect
        x={x + (width - islandWidth) / 2}
        y={screenY + bezel * 0.9}
        width={islandWidth}
        height={islandHeight}
        rx={islandHeight / 2}
        fill="#101012"
      />
    </g>
  );
}

/**
 * 「打者も投手も、入力するだけで自動計算」の図。
 * 構図: 左の端末で打席結果を入力し、右に算出された指標のカードが並ぶ。
 */
export default function AutoCalcIllustration() {
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 12, cy: 30, r: 7, fill: "#5B8DEF", opacity: 0.22 },
          { cx: 168, cy: 178, r: 9, fill: "#4F9E6B", opacity: 0.22 },
        ]}
      />
      <PhoneMock>
        <rect x={36} y={42} width={40} height={6} rx={3} fill={MUTED} />
        {PLATE_APPEARANCES.map((plateAppearance, index) => {
          const rowY = 56 + index * 26;
          return (
            <g key={plateAppearance.label}>
              <rect
                x={34}
                y={rowY}
                width={108}
                height={20}
                rx={6}
                fill={CARD_BG}
              />
              <text x={42} y={rowY + 13.5} fill={SUB_INK} fontSize={9}>
                {plateAppearance.label}
              </text>
              <rect
                x={102}
                y={rowY + 3}
                width={34}
                height={14}
                rx={7}
                fill={plateAppearance.isHit ? BRAND : MUTED}
              />
              <text
                x={119}
                y={rowY + 13.5}
                fill={plateAppearance.isHit ? ON_BRAND_INK : INK}
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
              >
                {plateAppearance.result}
              </text>
            </g>
          );
        })}
        <rect x={34} y={162} width={108} height={20} rx={6} fill={CARD_BG} />
        <text x={42} y={175.5} fill={SUB_INK} fontSize={9}>
          投球
        </text>
        <text
          x={136}
          y={175.5}
          fill={INK}
          fontSize={9}
          fontWeight="bold"
          textAnchor="end"
        >
          6回 2失点
        </text>
      </PhoneMock>

      <path
        d="M158 88 L166 96 L158 104"
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {METRICS.map((metric) => {
        const centerX = METRIC_CARD.x + METRIC_CARD.width / 2;
        const centerY = metric.y + METRIC_CARD.height / 2;
        return (
          <g
            key={metric.label}
            transform={`rotate(${metric.rotate} ${centerX} ${centerY})`}
          >
            {metric.isHighlighted ? (
              <rect
                x={METRIC_CARD.x}
                y={metric.y}
                width={METRIC_CARD.width}
                height={METRIC_CARD.height}
                rx={12}
                fill={BRAND_SOFT}
                stroke={BRAND}
                strokeWidth={1.5}
              />
            ) : (
              <Card
                x={METRIC_CARD.x}
                y={metric.y}
                width={METRIC_CARD.width}
                height={METRIC_CARD.height}
              />
            )}
            <text
              x={METRIC_CARD.x + 10}
              y={metric.y + 16}
              fill={SUB_INK}
              fontSize={10}
            >
              {metric.label}
            </text>
            <text
              x={METRIC_CARD.x + 10}
              y={metric.y + 36}
              fill={metric.isHighlighted ? BRAND : INK}
              fontSize={19}
              fontWeight="bold"
            >
              {metric.value}
            </text>
          </g>
        );
      })}

      <Sparkle x={264} y={16} size={7} />
      <Sparkle x={272} y={98} size={4} />
    </ArtCanvas>
  );
}
