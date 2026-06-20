"use client";
import type { HitLocationPoint } from "../../analysisActions";
import {
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
import { PLATE_RESULT_IDS } from "@app/constants/plateResults";

interface SprayChartProps {
  points: HitLocationPoint[];
}

const HIT_IDS: readonly number[] = [
  PLATE_RESULT_IDS.SINGLE,
  PLATE_RESULT_IDS.DOUBLE,
  PLATE_RESULT_IDS.TRIPLE,
  PLATE_RESULT_IDS.HOME_RUN,
];
const OUT_IDS: readonly number[] = [
  PLATE_RESULT_IDS.GROUND_OUT,
  PLATE_RESULT_IDS.FLY_OUT,
  PLATE_RESULT_IDS.FOUL_FLY,
  PLATE_RESULT_IDS.LINE_OUT,
  PLATE_RESULT_IDS.DOUBLE_PLAY,
];

const colorFor = (plateResultId: number): string => {
  if (HIT_IDS.includes(plateResultId)) return "#ef4444";
  if (OUT_IDS.includes(plateResultId)) return "#a1a1aa";
  return "#d08000";
};

/** 打球分布図。hit_locations の正規化座標をグラウンド上に色分けしてプロットする。 */
export function SprayChart({ points }: SprayChartProps) {
  return (
    <div className="flex flex-col items-center gap-y-2">
      <svg
        width={GROUND_CANVAS_WIDTH}
        height={GROUND_CANVAS_HEIGHT}
        viewBox={`0 0 ${GROUND_CANVAS_WIDTH} ${GROUND_CANVAS_HEIGHT}`}
        className="max-w-full h-auto"
      >
        <path
          d={`M ${GROUND_HOME.x},${GROUND_HOME.y} L ${GROUND_LEFT_END.x},${GROUND_LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${GROUND_RIGHT_END.x},${GROUND_RIGHT_END.y} Z`}
          fill="#3a5e2c"
          stroke="#2f4d24"
          strokeWidth={2}
        />
        <path
          d={`M ${GROUND_HOME.x},${GROUND_HOME.y} L ${GROUND_FIRST.x},${GROUND_FIRST.y} L ${GROUND_SECOND.x},${GROUND_SECOND.y} L ${GROUND_THIRD.x},${GROUND_THIRD.y} Z`}
          fill="#4a7335"
        />
        <line
          x1={GROUND_HOME.x}
          y1={GROUND_HOME.y}
          x2={GROUND_LEFT_END.x}
          y2={GROUND_LEFT_END.y}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
        />
        <line
          x1={GROUND_HOME.x}
          y1={GROUND_HOME.y}
          x2={GROUND_RIGHT_END.x}
          y2={GROUND_RIGHT_END.y}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x * GROUND_CANVAS_WIDTH}
            cy={point.y * GROUND_CANVAS_HEIGHT}
            r={5}
            fill={colorFor(point.plate_result_id)}
            opacity={0.85}
          />
        ))}
      </svg>
      <div className="flex gap-x-4 text-xs text-zinc-400">
        <span className="flex items-center gap-x-1">
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
          安打
        </span>
        <span className="flex items-center gap-x-1">
          <span className="h-2 w-2 rounded-full bg-[#a1a1aa]" />
          アウト
        </span>
        <span className="flex items-center gap-x-1">
          <span className="h-2 w-2 rounded-full bg-[#d08000]" />
          その他
        </span>
      </div>
      {points.length === 0 ? (
        <p className="text-sm text-zinc-500">打球データがありません。</p>
      ) : null}
    </div>
  );
}
