"use client";
import type { HitDirection } from "../../analysisActions";
import { Fragment, useState } from "react";
import {
  DIRECTION_LABEL_POSITIONS,
  DIRECTION_LABELS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
  GROUND_FIRST,
  GROUND_HOME,
  GROUND_LEFT_END,
  GROUND_OUTFIELD_RX,
  GROUND_OUTFIELD_RY,
  GROUND_RIGHT_END,
  GROUND_SECOND,
  GROUND_THIRD,
} from "@app/constants/groundCanvas";

interface HitDirectionTableProps {
  directions: HitDirection[];
}

const WIDTH = GROUND_CANVAS_WIDTH;
const HEIGHT = GROUND_CANVAS_HEIGHT;
const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;

const CIRCLE_RADIUS = 22;

// 捕手(id=2)のサークルが下端で見切れないよう viewBox を下方向に拡張する。
const BOTTOM_PADDING = 28;
const SVG_HEIGHT = HEIGHT + BOTTOM_PADDING;

const STRIPE_X_POSITIONS: readonly number[] = Array.from(
  { length: 20 },
  (_, i) => -100 + i * 30,
);

// ブランド色 #d08000 を基準に、打率の高さに応じた透明度で塗る。
const HEAT_BASE = { r: 0xd0, g: 0x80, b: 0x00 };
const HEAT_MAX_AVG = 0.4;

const getHeatColor = (battingAverage: number, atBats: number): string => {
  if (atBats === 0) return "rgba(82, 82, 91, 0.55)";
  const ratio = Math.min(1, Math.max(0, battingAverage / HEAT_MAX_AVG));
  const alpha = 0.35 + 0.65 * ratio;
  return `rgba(${HEAT_BASE.r}, ${HEAT_BASE.g}, ${HEAT_BASE.b}, ${alpha.toFixed(2)})`;
};

const formatAverage = (hits: number, atBats: number): string => {
  if (atBats === 0) return "—";
  const value = hits / atBats;
  return value.toFixed(3).replace(/^0\./, ".");
};

/**
 * 方向別の打率を球場図上にヒートマップとして表示する。
 * 球場描画は SprayChart と同一にし見た目を統一する。
 * 円の色濃度 = 打率の高さ、中央テキスト = 打率値（0打数は「—」）。サークルタップで内訳を表示。
 */
export function HitDirectionTable({ directions }: HitDirectionTableProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ダート半円（SprayChart と同じ算出）
  const dirtCenterX = HOME.x;
  const dirtCenterY = FIRST.y + 5;
  const dirtRadius = 68;

  const hasAnyAtBats = directions.some((direction) => direction.at_bats > 0);
  if (!hasAnyAtBats) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">
          方向別の打率
        </h3>
        <div className="flex flex-col items-center py-8">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            打球データなし
          </p>
          <p className="text-[11px] text-[#71717A]">
            新仕様で記録した打席のみが対象です
          </p>
        </div>
      </section>
    );
  }

  const selectedDirection = selectedId
    ? directions.find((direction) => direction.id === selectedId)
    : null;
  const selectedLabel = selectedId ? DIRECTION_LABELS[selectedId] : null;
  const handleCirclePress = (id: number) =>
    setSelectedId((prev) => (prev === id ? null : id));

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">方向別の打率</h3>

      <div className="flex justify-center">
        <svg
          width="100%"
          viewBox={`0 0 ${WIDTH} ${SVG_HEIGHT}`}
          className="max-w-[420px]"
        >
          <defs>
            <clipPath id="fieldClipHeat">
              <path
                d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
              />
            </clipPath>
          </defs>

          {/* 外野（緑の芝 + ストライプ） */}
          <g clipPath="url(#fieldClipHeat)">
            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#4a8e32" />
            {STRIPE_X_POSITIONS.map((x, i) => (
              <rect
                key={`stripe-${i}`}
                x={x}
                y={0}
                width={15}
                height={HEIGHT * 2}
                fill="#56a03c"
                opacity={0.5}
                transform="rotate(-45, 210, 160)"
              />
            ))}
          </g>

          {/* 外野の輪郭線 */}
          <path
            d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
            fill="none"
            stroke="#3a7a28"
            strokeWidth={2}
          />

          {/* 内野ダート（半円 + ホームまでの台形） */}
          <path
            d={`M ${dirtCenterX - dirtRadius},${dirtCenterY} A ${dirtRadius},${dirtRadius} 0 0,1 ${dirtCenterX + dirtRadius},${dirtCenterY} L ${HOME.x + 20},${HOME.y + 5} L ${HOME.x - 20},${HOME.y + 5} Z`}
            fill="#b07840"
          />

          {/* 内野の芝（ダイヤモンド内の緑） */}
          <path
            d={`M ${HOME.x},${HOME.y - 15} L ${FIRST.x - 5},${FIRST.y + 2} L ${SECOND.x},${SECOND.y + 8} L ${THIRD.x + 5},${THIRD.y + 2} Z`}
            fill="#4a8e32"
          />

          {/* ファウルライン */}
          <line
            x1={HOME.x}
            y1={HOME.y}
            x2={LEFT_END.x}
            y2={LEFT_END.y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
          />
          <line
            x1={HOME.x}
            y1={HOME.y}
            x2={RIGHT_END.x}
            y2={RIGHT_END.y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
          />

          {/* ベースライン */}
          <line
            x1={HOME.x}
            y1={HOME.y - 3}
            x2={FIRST.x}
            y2={FIRST.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <line
            x1={FIRST.x}
            y1={FIRST.y}
            x2={SECOND.x}
            y2={SECOND.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <line
            x1={SECOND.x}
            y1={SECOND.y}
            x2={THIRD.x}
            y2={THIRD.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <line
            x1={THIRD.x}
            y1={THIRD.y}
            x2={HOME.x}
            y2={HOME.y - 3}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />

          {/* マウンド */}
          <circle
            cx={HOME.x}
            cy={(HOME.y + SECOND.y) / 2 + 5}
            r={9}
            fill="#9a6d3a"
          />
          <rect
            x={HOME.x - 3}
            y={(HOME.y + SECOND.y) / 2 + 3}
            width={6}
            height={2}
            rx={1}
            fill="#c4a070"
          />

          {/* ベース */}
          <polygon
            points={`${HOME.x},${HOME.y - 8} ${HOME.x - 6},${HOME.y - 3} ${HOME.x - 4},${HOME.y + 2} ${HOME.x + 4},${HOME.y + 2} ${HOME.x + 6},${HOME.y - 3}`}
            fill="white"
          />
          <rect
            x={FIRST.x - 4}
            y={FIRST.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${FIRST.x}, ${FIRST.y})`}
          />
          <rect
            x={SECOND.x - 4}
            y={SECOND.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${SECOND.x}, ${SECOND.y})`}
          />
          <rect
            x={THIRD.x - 4}
            y={THIRD.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${THIRD.x}, ${THIRD.y})`}
          />

          {/* バッターボックス */}
          <rect
            x={HOME.x - 15}
            y={HOME.y - 10}
            width={8}
            height={18}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={0.8}
          />
          <rect
            x={HOME.x + 7}
            y={HOME.y - 10}
            width={8}
            height={18}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={0.8}
          />

          {/* キャッチャーエリア */}
          <path
            d={`M ${HOME.x - 12},${HOME.y + 5} Q ${HOME.x},${HOME.y + 18} ${HOME.x + 12},${HOME.y + 5}`}
            fill="none"
            stroke="#9a6d3a"
            strokeWidth={3}
          />

          {/* 各方向のヒートサークル */}
          {Object.entries(DIRECTION_LABELS).map(([idKey, label]) => {
            const id = Number(idKey);
            const position = DIRECTION_LABEL_POSITIONS[id];
            if (!position) return null;
            const direction = directions.find((item) => item.id === id);
            const atBats = direction?.at_bats ?? 0;
            const hits = direction?.hits ?? 0;
            const battingAverage = atBats > 0 ? hits / atBats : 0;
            const color = getHeatColor(battingAverage, atBats);
            const isSelected = selectedId === id;

            return (
              <Fragment key={id}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={CIRCLE_RADIUS + 1}
                  fill="black"
                  opacity={0.25}
                />
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={CIRCLE_RADIUS}
                  fill={color}
                  stroke={isSelected ? "#FACC15" : "rgba(255,255,255,0.6)"}
                  strokeWidth={isSelected ? 2.5 : 0.8}
                  className="cursor-pointer"
                  onClick={() => handleCirclePress(id)}
                />
                <text
                  x={position.x}
                  y={position.y - 2}
                  textAnchor="middle"
                  fill="#F4F4F4"
                  fontSize={12}
                  fontWeight={700}
                  className="pointer-events-none"
                >
                  {formatAverage(hits, atBats)}
                </text>
                <text
                  x={position.x}
                  y={position.y + 12}
                  textAnchor="middle"
                  fill="#F4F4F4"
                  fontSize={9}
                  fontWeight={600}
                  className="pointer-events-none"
                >
                  {label}
                </text>
              </Fragment>
            );
          })}
        </svg>
      </div>

      {selectedDirection && selectedLabel ? (
        <div className="mt-3 rounded-lg bg-[#27272A] px-3.5 py-3">
          <div className="mb-2.5 flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#F4F4F4]">
              {selectedLabel} 方向
            </h4>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="px-1 py-0.5 text-sm font-semibold text-[#A1A1AA]"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
          <div className="flex justify-between">
            <DetailStat
              label="打数"
              value={String(selectedDirection.at_bats)}
            />
            <DetailStat label="安打" value={String(selectedDirection.hits)} />
            <DetailStat
              label="打率"
              value={formatAverage(
                selectedDirection.hits,
                selectedDirection.at_bats,
              )}
              highlight
            />
            <DetailStat
              label="長打率"
              value={formatAverage(
                selectedDirection.total_bases,
                selectedDirection.at_bats,
              )}
              highlight
            />
          </div>
          <div className="my-2 h-px bg-[#3F3F46]" />
          <div className="flex justify-between">
            <DetailStat
              label="二塁打"
              value={String(selectedDirection.two_base_hit)}
            />
            <DetailStat
              label="三塁打"
              value={String(selectedDirection.three_base_hit)}
            />
            <DetailStat
              label="本塁打"
              value={String(selectedDirection.home_run)}
            />
            <DetailStat
              label="塁打"
              value={String(selectedDirection.total_bases)}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-[11px] text-[#A1A1AA]">低い</span>
        <div className="flex h-2 overflow-hidden rounded">
          {Array.from({ length: 12 }, (_, i) => {
            const t = i / 11;
            const alpha = 0.35 + 0.65 * t;
            return (
              <span
                key={i}
                className="h-2 w-3"
                style={{
                  backgroundColor: `rgba(${HEAT_BASE.r},${HEAT_BASE.g},${HEAT_BASE.b},${alpha.toFixed(2)})`,
                }}
              />
            );
          })}
        </div>
        <span className="text-[11px] text-[#A1A1AA]">高い</span>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-[#71717A]">
        色の濃さ = 打率の高さ（.400 以上は最大濃度）/ 0打数は「—」
      </p>
    </section>
  );
}

function DetailStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="mb-0.5 text-[10px] text-[#A1A1AA]">{label}</span>
      <span
        className={`text-base font-bold ${
          highlight ? "text-[#d08000]" : "text-[#F4F4F4]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
