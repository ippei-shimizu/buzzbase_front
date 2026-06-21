"use client";
import type {
  HitDirection,
  HitLocationPoint,
  HomeRunDirection,
} from "../../analysisActions";
import { Fragment, useState } from "react";
import {
  DIRECTION_LABEL_POSITIONS,
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

export type SprayChartMode = "scatter" | "bubbles";

interface SprayChartProps {
  directions: HitDirection[];
  homeRuns?: HomeRunDirection[];
  mode?: SprayChartMode;
  onModeChange?: (mode: SprayChartMode) => void;
  points?: HitLocationPoint[];
}

// plate_result_id → バブルと同じカテゴリ表示名へのマップ。
// scatter モードの点を CATEGORY_COLORS で色分けし、バブル凡例と統一する。
// 四死球(15/16)は打球結果ではないため意図的に含めない。
const PLATE_RESULT_TO_CATEGORY: Record<number, string> = {
  7: "単打",
  8: "長打",
  9: "長打",
  10: "本塁打",
  1: "ゴロ",
  2: "フライ",
  3: "フライ",
  4: "フライ",
  13: "三振",
  14: "三振",
};

const getPointCategory = (plateResultId: number): string =>
  PLATE_RESULT_TO_CATEGORY[plateResultId] || "その他";

const LEGEND_CATEGORIES = [
  "単打",
  "長打",
  "本塁打",
  "ゴロ",
  "フライ",
  "三振",
  "その他",
] as const;

const WIDTH = GROUND_CANVAS_WIDTH;
const HEIGHT = GROUND_CANVAS_HEIGHT;

const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const OUTFIELD_RX = GROUND_OUTFIELD_RX;
const OUTFIELD_RY = GROUND_OUTFIELD_RY;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;

const DIRECTION_POSITIONS = DIRECTION_LABEL_POSITIONS;

// 本塁打バブルは外野フェンス（楕円）の少し外側に配置する。
const HR_OFFSET = 25;
const getHrPosition = (dirId: number): { x: number; y: number } | null => {
  const angles: Record<number, number> = {
    7: 135,
    8: 126,
    9: 113,
    10: 90,
    11: 67,
    12: 54,
    13: 45,
  };
  const deg = angles[dirId];
  if (deg === undefined) return null;
  const rad = (deg * Math.PI) / 180;
  const rx = OUTFIELD_RX + HR_OFFSET;
  const ry = OUTFIELD_RY + HR_OFFSET;
  return {
    x: HOME.x + rx * Math.cos(rad),
    y: HOME.y - ry * Math.sin(rad),
  };
};

const STRIPE_X_POSITIONS: readonly number[] = Array.from(
  { length: 20 },
  (_, i) => -100 + i * 30,
);

// 中(id=10)方向の本塁打バブルが viewBox 上端を、捕手方向のバブルが下端を
// 超えるため上下に余白を確保する（バブル最大半径も加味）。
const TOP_PADDING = 30;
const BOTTOM_PADDING = 28;
const SVG_VIEWBOX_HEIGHT = HEIGHT + TOP_PADDING + BOTTOM_PADDING;

const getBubbleRadius = (count: number, maxCount: number): number => {
  if (count === 0 || maxCount === 0) return 0;
  return 8 + (count / maxCount) * 14;
};

const CATEGORY_COLORS: Record<string, string> = {
  単打: "#f31260",
  長打: "#F54180",
  本塁打: "#FAA0BF",
  ゴロ: "#71717A",
  フライ: "#9CA3AF",
  三振: "#d08000",
  その他: "#8b5cf6",
};

const getBubbleColor = (topCategory: string): string =>
  CATEGORY_COLORS[topCategory] || "#71717A";

const getBubbleOpacity = (count: number, maxCount: number): number => {
  if (maxCount === 0) return 0;
  return 0.5 + (count / maxCount) * 0.4;
};

/**
 * 打球分布図。点プロット（保存座標の散布）/ バブル（方向別集計）を切り替えて表示する。
 * 球場形状は打席記録 UI と共通の座標系を使い、保存済み hit_location が同じ位置に描かれる。
 */
export function SprayChart({
  directions,
  homeRuns = [],
  mode = "scatter",
  onModeChange,
  points = [],
}: SprayChartProps) {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set<string>(LEGEND_CATEGORIES),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allCounts = [
    ...directions.map((direction) => direction.count),
    ...homeRuns.map((homeRun) => homeRun.count),
  ];
  const maxCount = Math.max(...allCounts, 1);
  const isScatter = mode === "scatter";

  const toggleCategory = (category: string) =>
    setActiveCategories((prev) => {
      const next = new Set<string>(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  const allActive = activeCategories.size === LEGEND_CATEGORIES.length;
  const filterLabel = (() => {
    if (allActive) return "全て";
    if (activeCategories.size === 0) return "なし";
    if (activeCategories.size === 1) return Array.from(activeCategories)[0];
    return `${activeCategories.size} 件選択`;
  })();
  const selectAll = () =>
    setActiveCategories(new Set<string>(LEGEND_CATEGORIES));

  // ダート半円の中心とサイズ
  const dirtCenterX = HOME.x;
  const dirtCenterY = FIRST.y + 5;
  const dirtRadius = 68;

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">打球分布図</h3>
        {onModeChange ? (
          <div className="flex rounded-md bg-[#27272A] p-0.5">
            <button
              type="button"
              onClick={() => onModeChange("scatter")}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                isScatter ? "bg-[#52525B] text-[#F4F4F4]" : "text-[#A1A1AA]"
              }`}
            >
              点プロット
            </button>
            <button
              type="button"
              onClick={() => onModeChange("bubbles")}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                !isScatter ? "bg-[#52525B] text-[#F4F4F4]" : "text-[#A1A1AA]"
              }`}
            >
              バブル
            </button>
          </div>
        ) : null}
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
              {LEGEND_CATEGORIES.map((category) => {
                const isActive = activeCategories.has(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[category] }}
                    />
                    <span
                      className={`flex-1 text-[13px] ${
                        isActive
                          ? "font-semibold text-[#d08000]"
                          : "text-[#F4F4F4]"
                      }`}
                    >
                      {category}
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
          viewBox={`0 -${TOP_PADDING} ${WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
          className="max-w-[420px]"
        >
          <defs>
            <clipPath id="fieldClip">
              <path
                d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${OUTFIELD_RX},${OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
              />
            </clipPath>
          </defs>

          {/* 外野（緑の芝 + ストライプ） */}
          <g clipPath="url(#fieldClip)">
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
            d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${OUTFIELD_RX},${OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
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

          {!isScatter
            ? directions.map((direction) => {
                const pos = DIRECTION_POSITIONS[direction.id];
                if (!pos || direction.count === 0) return null;
                // バブルは方向単位なので最多カテゴリ(top_category)でフィルタする。
                // 同じ方向に複数カテゴリが混在しても top_category だけで表示可否が決まる。
                if (!activeCategories.has(direction.top_category)) return null;
                const r = getBubbleRadius(direction.count, maxCount);
                const color = getBubbleColor(direction.top_category);
                const opacity = getBubbleOpacity(direction.count, maxCount);
                return (
                  <Fragment key={direction.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r + 2}
                      fill="black"
                      opacity={0.15}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={color}
                      opacity={opacity}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={r > 14 ? 12 : 10}
                      fontWeight={700}
                    >
                      {direction.count}
                    </text>
                  </Fragment>
                );
              })
            : null}

          {!isScatter && activeCategories.has("本塁打")
            ? homeRuns.map((homeRun) => {
                const pos = getHrPosition(homeRun.id);
                if (!pos) return null;
                const r = getBubbleRadius(homeRun.count, maxCount);
                const opacity = getBubbleOpacity(homeRun.count, maxCount);
                return (
                  <Fragment key={`hr-${homeRun.id}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r + 2}
                      fill="black"
                      opacity={0.15}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill="#FAA0BF"
                      opacity={opacity}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={r > 14 ? 12 : 10}
                      fontWeight={700}
                    >
                      {homeRun.count}
                    </text>
                  </Fragment>
                );
              })
            : null}

          {isScatter
            ? points.map((point, index) => {
                const category = getPointCategory(point.plate_result_id);
                if (!activeCategories.has(category)) return null;
                return (
                  <circle
                    key={`point-${index}`}
                    cx={point.x * WIDTH}
                    cy={point.y * HEIGHT}
                    r={5}
                    fill={CATEGORY_COLORS[category] || "#71717A"}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth={0.5}
                  />
                );
              })
            : null}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        {LEGEND_CATEGORIES.map((category) => (
          <div key={category} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
            />
            <span className="text-[11px] text-[#A1A1AA]">{category}</span>
          </div>
        ))}
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
