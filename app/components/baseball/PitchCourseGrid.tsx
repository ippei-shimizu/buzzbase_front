"use client";
import {
  PITCH_COURSES,
  PITCH_COURSE_TRACK_FRACTIONS,
  isStrikeZoneCourse,
  pitchCourseCol,
  pitchCourseRow,
} from "@app/constants/pitchCourse";

const TRACK_TEMPLATE = PITCH_COURSE_TRACK_FRACTIONS.map(
  (fraction) => `${fraction}fr`,
).join(" ");

interface PitchCourseGridProps {
  /** 各セルの中身（ボタンや色付き div）。セル枠・ストライクゾーン枠線はグリッド側が描く。 */
  renderCell: (course: number, isStrikeZone: boolean) => React.ReactNode;
  className?: string;
}

// ストライクゾーン（中央3x3）の外周にだけ実線ボーダーを引くためのクラス。
const strikeZoneBorderClass = (course: number): string => {
  if (!isStrikeZoneCourse(course)) return "";
  const row = pitchCourseRow(course);
  const col = pitchCourseCol(course);
  const classes: string[] = [];
  if (row === 2) classes.push("border-t-2");
  if (row === 4) classes.push("border-b-2");
  if (col === 2) classes.push("border-l-2");
  if (col === 4) classes.push("border-r-2");
  return classes.length > 0 ? `${classes.join(" ")} border-zinc-200` : "";
};

/**
 * 投球コースの 5x5 グリッド（捕手目線）。入力フィールドと分析ヒートマップで
 * PITCH_COURSE_TRACK_FRACTIONS の幾何を共有する。
 */
export function PitchCourseGrid({
  renderCell,
  className,
}: PitchCourseGridProps) {
  return (
    <div
      className={`grid gap-px ${className ?? ""}`}
      style={{
        gridTemplateColumns: TRACK_TEMPLATE,
        gridTemplateRows: TRACK_TEMPLATE,
      }}
    >
      {PITCH_COURSES.map((course) => (
        <div key={course} className={strikeZoneBorderClass(course)}>
          {renderCell(course, isStrikeZoneCourse(course))}
        </div>
      ))}
    </div>
  );
}
