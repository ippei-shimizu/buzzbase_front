"use client";
import { PitchCourseTapField } from "@app/components/baseball/PitchCourseTapField";
import {
  pitchCourseLabel,
  type PitchCoursePoint,
} from "@app/constants/pitchCourse";
import { FieldLabel } from "./DetailFields";

interface PitchCourseSelectorProps {
  value: number | null;
  location: PitchCoursePoint | null;
  onChange: (
    value: { course: number; location: PitchCoursePoint } | null,
  ) => void;
  description?: string;
}

const HOME_PLATE = (
  <svg aria-hidden="true" width="56" height="26" viewBox="0 0 56 26">
    <polygon
      points="2,2 54,2 54,12 28,24 2,12"
      fill="none"
      stroke="#71717a"
      strokeWidth="2"
    />
  </svg>
);

/**
 * 投球コース（捕手目線）の入力セレクタ。
 * コース図の任意の位置をタップして指定し、そこから導出した 5x5 のコースを
 * マスのハイライトとテキストで示す。「クリア」で未選択に戻せる。
 */
export function PitchCourseSelector({
  value,
  location,
  onChange,
  description,
}: PitchCourseSelectorProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <FieldLabel label="コース" description={description} />
      <div className="flex items-stretch gap-x-2">
        {/* 高さ方向の軸ラベル。外周(0.62fr)を除いた内側3行の目安として等分配置する。 */}
        <div
          aria-hidden="true"
          className="flex flex-col justify-around py-8 text-[10px] text-zinc-400"
        >
          <span>高め</span>
          <span>真ん中</span>
          <span>低め</span>
        </div>
        <div className="w-full max-w-[300px]">
          <div className="h-[300px]">
            <PitchCourseTapField
              course={value}
              location={location}
              onSelect={({ x, y, course }) =>
                onChange({ course, location: { x, y } })
              }
            />
          </div>
          <div
            aria-hidden="true"
            className="flex justify-around pt-1 text-[10px] text-zinc-400"
          >
            <span>三塁側</span>
            <span>真ん中</span>
            <span>一塁側</span>
          </div>
          <div className="flex justify-center pt-1">{HOME_PLATE}</div>
        </div>
      </div>
      <div className="relative flex min-h-8 items-center justify-center">
        <p aria-live="polite">
          <span
            className={`inline-flex items-center rounded-full px-3.5 py-1 text-sm font-bold ${
              value === null
                ? "bg-[#3A3A3A] text-zinc-400"
                : "bg-[#d08000] text-white"
            }`}
          >
            {value !== null ? pitchCourseLabel(value) : "未選択"}
          </span>
        </p>
        {value !== null ? (
          <button
            type="button"
            className="absolute right-0 px-1 py-1 text-xs text-zinc-400 underline"
            onClick={() => onChange(null)}
          >
            クリア
          </button>
        ) : null}
      </div>
    </div>
  );
}
