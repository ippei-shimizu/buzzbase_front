"use client";
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
import {
  detectClosestDirection,
  type Point,
} from "@app/utils/groundZoneDetector";

interface GroundTapFieldProps {
  hitLocation: Point | null;
  onSelect: (args: {
    x: number;
    y: number;
    directionId: number | null;
  }) => void;
}

// 球場形状の派生座標（mobile の GroundTapField と同一の計算）。
const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;
const MOUND = { x: HOME.x, y: (HOME.y + SECOND.y) / 2 + 5 };
const DIRT_CENTER = { x: HOME.x, y: (HOME.y + SECOND.y) / 2 };
const DIRT_R = 95;
const DIRT_DY = HOME.y - DIRT_CENTER.y;
const DIRT_LINE_CHORD = Math.sqrt(DIRT_R ** 2 - DIRT_DY ** 2 / 2);
const DIRT_FOUL_LEFT = {
  x: HOME.x - DIRT_DY / 2 - DIRT_LINE_CHORD / Math.SQRT2,
  y: HOME.y - DIRT_DY / 2 - DIRT_LINE_CHORD / Math.SQRT2,
};
const DIRT_FOUL_RIGHT = {
  x: HOME.x + DIRT_DY / 2 + DIRT_LINE_CHORD / Math.SQRT2,
  y: HOME.y - DIRT_DY / 2 - DIRT_LINE_CHORD / Math.SQRT2,
};

const CHIP_HEIGHT = 18;
const CHIP_PADDING_X = 6;
const estimateChipWidth = (label: string): number =>
  CHIP_PADDING_X * 2 + label.length * 12;

const clampNormalized = (value: number): number =>
  Math.max(0, Math.min(1, value));

/**
 * グラウンドイラスト。クリック位置を 0〜1 の正規化座標に変換し、
 * detectClosestDirection で最寄りの打球方向 id を導出して親へ通知する。
 */
export function GroundTapField({ hitLocation, onSelect }: GroundTapFieldProps) {
  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampNormalized((event.clientX - rect.left) / rect.width);
    const y = clampNormalized((event.clientY - rect.top) / rect.height);
    onSelect({ x, y, directionId: detectClosestDirection({ x, y }) });
  };

  const markerX = hitLocation ? hitLocation.x * GROUND_CANVAS_WIDTH : null;
  const markerY = hitLocation ? hitLocation.y * GROUND_CANVAS_HEIGHT : null;
  const selectedDirectionId = hitLocation
    ? detectClosestDirection(hitLocation)
    : null;

  return (
    <div className="flex justify-center">
      <svg
        role="button"
        aria-label="グラウンド（クリックで打球方向を選択）"
        width={GROUND_CANVAS_WIDTH}
        height={GROUND_CANVAS_HEIGHT}
        viewBox={`0 0 ${GROUND_CANVAS_WIDTH} ${GROUND_CANVAS_HEIGHT}`}
        className="max-w-full h-auto cursor-pointer touch-none select-none"
        onClick={handleClick}
      >
        <path
          d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
          fill="#4a8e32"
          stroke="#3a7a28"
          strokeWidth={2}
        />
        <path
          d={`M ${HOME.x},${HOME.y} L ${DIRT_FOUL_LEFT.x},${DIRT_FOUL_LEFT.y} A ${DIRT_R},${DIRT_R} 0 0,1 ${DIRT_FOUL_RIGHT.x},${DIRT_FOUL_RIGHT.y} Z`}
          fill="#b07840"
        />
        <path
          d={`M ${HOME.x},${HOME.y} L ${FIRST.x},${FIRST.y} L ${SECOND.x},${SECOND.y} L ${THIRD.x},${THIRD.y} Z`}
          fill="#5fa341"
        />
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
        <circle cx={MOUND.x} cy={MOUND.y} r={9} fill="#9a6d3a" />
        <polygon
          points={`${HOME.x},${HOME.y - 8} ${HOME.x - 6},${HOME.y - 3} ${HOME.x - 4},${HOME.y + 2} ${HOME.x + 4},${HOME.y + 2} ${HOME.x + 6},${HOME.y - 3}`}
          fill="white"
        />
        {[FIRST, SECOND, THIRD].map((base, index) => (
          <rect
            key={`base-${index}`}
            x={base.x - 4}
            y={base.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${base.x}, ${base.y})`}
          />
        ))}
        {selectedDirectionId !== null &&
          DIRECTION_LABEL_POSITIONS[selectedDirectionId] && (
            <circle
              cx={DIRECTION_LABEL_POSITIONS[selectedDirectionId].x}
              cy={DIRECTION_LABEL_POSITIONS[selectedDirectionId].y}
              fill="none"
              stroke="#d08000"
              strokeWidth={2}
            >
              <animate
                attributeName="r"
                values="10;42"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        {Object.entries(DIRECTION_LABELS).map(([idKey, label]) => {
          const id = Number(idKey);
          const position = DIRECTION_LABEL_POSITIONS[id];
          if (!position) return null;
          const chipWidth = estimateChipWidth(label);
          const isSelected = selectedDirectionId === id;
          return (
            <g key={`dir-${id}`}>
              <rect
                x={position.x - chipWidth / 2}
                y={position.y - CHIP_HEIGHT / 2}
                width={chipWidth}
                height={CHIP_HEIGHT}
                rx={4}
                fill={isSelected ? "#d08000" : "rgba(0,0,0,0.65)"}
              />
              <text
                x={position.x}
                y={position.y + 4}
                fill="#F4F4F4"
                fontSize={11}
                fontWeight={700}
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}
        {markerX !== null && markerY !== null && (
          <>
            <circle
              cx={markerX}
              cy={markerY}
              r={10}
              fill="#d08000"
              opacity={0.35}
            />
            <circle cx={markerX} cy={markerY} r={6} fill="#d08000" />
          </>
        )}
      </svg>
    </div>
  );
}
