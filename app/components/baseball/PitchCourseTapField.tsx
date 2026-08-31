"use client";
import { PitchCourseGrid } from "@app/components/baseball/PitchCourseGrid";
import {
  detectPitchCourse,
  pitchCourseCenter,
  pitchCourseCol,
  pitchCourseLabel,
  pitchCourseRow,
  type PitchCoursePoint,
} from "@app/constants/pitchCourse";

interface PitchCourseTapFieldProps {
  /** タップ位置から導出済みのコース (1〜25)。 */
  course: number | null;
  /** タップ位置の正規化座標。座標を持たない既存レコードでは null。 */
  location: PitchCoursePoint | null;
  /** 未指定なら表示専用モード（打席詳細の読み取り専用プロット）。 */
  onSelect?: (args: { x: number; y: number; course: number }) => void;
}

const clampNormalized = (value: number): number =>
  Math.max(0, Math.min(1, value));

const clampTrack = (value: number): number => Math.max(1, Math.min(5, value));

// 矢印キー1回あたりの移動量（行, 列）。
const KEY_MOVES: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

// キーボード操作の起点。未選択のまま矢印キーを押したときは真ん中から動かす。
const KEYBOARD_START_COURSE = 13;

/**
 * 投球コースをコース図の自由な位置へのタップで指定するフィールド。
 * タップ座標から detectPitchCourse で 5x5 のどのコースかを導出し、
 * 該当マスをハイライトして「大まかにどのコースか」も同時に示す。
 */
export function PitchCourseTapField({
  course,
  location,
  onSelect,
}: PitchCourseTapFieldProps) {
  // 座標のない既存レコードはコースの中心にマーカーを置く。
  const marker =
    location ?? (course !== null ? pitchCourseCenter(course) : null);

  const isInteractive = onSelect !== undefined;
  const courseLabel = course !== null ? pitchCourseLabel(course) : "未選択";

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampNormalized((event.clientX - rect.left) / rect.width);
    const y = clampNormalized((event.clientY - rect.top) / rect.height);
    onSelect({ x, y, course: detectPitchCourse({ x, y }) });
  };

  // キーボードでは連続座標を指せないため、マスの中心を選んだものとして扱う。
  const selectByCell = (deltaRow: number, deltaCol: number) => {
    if (!onSelect) return;
    const current = course ?? KEYBOARD_START_COURSE;
    const row = clampTrack(pitchCourseRow(current) + deltaRow);
    const col = clampTrack(pitchCourseCol(current) + deltaCol);
    const nextCourse = (row - 1) * 5 + col;
    const center = pitchCourseCenter(nextCourse);
    onSelect({ x: center.x, y: center.y, course: nextCourse });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    const move = KEY_MOVES[event.key];
    if (move) {
      event.preventDefault();
      selectByCell(move[0], move[1]);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectByCell(0, 0);
    }
  };

  return (
    <div
      role={isInteractive ? "button" : "img"}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={
        isInteractive
          ? `コース図（タップまたは矢印キーで投球コースを選択）現在: ${courseLabel}`
          : `コース図: ${courseLabel}`
      }
      className={`relative h-full w-full touch-none select-none ${
        isInteractive
          ? "cursor-crosshair focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d08000]"
          : ""
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <PitchCourseGrid
        className="absolute inset-0 h-full"
        renderCell={(cellCourse, isStrikeZone) => (
          <div
            className={`h-full w-full rounded-[2px] ${
              cellCourse === course
                ? "bg-[#d08000]/40"
                : isStrikeZone
                  ? "bg-[#454545]"
                  : "bg-[#2a2a2a]"
            }`}
          />
        )}
      />
      {marker !== null ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#d08000] shadow"
          style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
        />
      ) : null}
    </div>
  );
}
