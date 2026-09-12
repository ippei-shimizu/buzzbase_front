"use client";
import { PitchCourseTapField } from "@app/components/baseball/PitchCourseTapField";
import { pitchCourseLabel } from "@app/constants/pitchCourse";

interface PitchCourseViewProps {
  course: number | null;
  // V2 レスポンスの pitch_course_x/y は DB decimal のため文字列で届く。
  pitchCourseX: string | null;
  pitchCourseY: string | null;
}

const parseLocation = (value: string | null): number | null => {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * 記録済みの投球コースを読み取り専用のコース図にプロットする。
 * 座標を持たない既存レコードはコースの中心にマーカーが立つ。
 */
export function PitchCourseView({
  course,
  pitchCourseX,
  pitchCourseY,
}: PitchCourseViewProps) {
  if (course === null) {
    return <p className="text-sm text-zinc-500">未記録</p>;
  }

  const x = parseLocation(pitchCourseX);
  const y = parseLocation(pitchCourseY);

  return (
    <div className="flex flex-col items-center gap-y-2">
      <div className="h-[200px] w-[200px]">
        <PitchCourseTapField
          course={course}
          location={x !== null && y !== null ? { x, y } : null}
        />
      </div>
      <span className="inline-flex items-center rounded-full bg-[#d08000] px-3.5 py-1 text-sm font-bold text-white">
        {pitchCourseLabel(course)}
      </span>
    </div>
  );
}
