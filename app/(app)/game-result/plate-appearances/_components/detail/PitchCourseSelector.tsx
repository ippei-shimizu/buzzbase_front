"use client";
import { useRef } from "react";
import { PitchCourseGrid } from "@app/components/baseball/PitchCourseGrid";
import {
  pitchCourseCol,
  pitchCourseLabel,
  pitchCourseRow,
} from "@app/constants/pitchCourse";
import { FieldLabel } from "./DetailFields";

interface PitchCourseSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
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
 * 投球コース（捕手目線 5x5）の入力セレクタ。
 * 選択済みセルの再タップ、または「クリア」で解除できる。
 * 矢印キーで roving tabindex のフォーカス移動に対応する。
 */
export function PitchCourseSelector({
  value,
  onChange,
  description,
}: PitchCourseSelectorProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const focusCourse = (course: number) => {
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-course="${course}"]`)
      ?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    course: number,
  ) => {
    const row = pitchCourseRow(course);
    const col = pitchCourseCol(course);
    let next: number | null = null;
    if (event.key === "ArrowUp") next = row > 1 ? course - 5 : null;
    else if (event.key === "ArrowDown") next = row < 5 ? course + 5 : null;
    else if (event.key === "ArrowLeft") next = col > 1 ? course - 1 : null;
    else if (event.key === "ArrowRight") next = col < 5 ? course + 1 : null;
    else return;
    event.preventDefault();
    if (next !== null) focusCourse(next);
  };

  // 未選択時は中央（13）を tab の入口にする。
  const tabStopCourse = value ?? 13;

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
          <div
            ref={gridRef}
            role="radiogroup"
            aria-label="コース"
            className="h-[300px]"
          >
            <PitchCourseGrid
              className="h-full"
              renderCell={(course, isStrikeZone) => {
                const isSelected = value === course;
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={pitchCourseLabel(course)}
                    data-course={course}
                    tabIndex={course === tabStopCourse ? 0 : -1}
                    className={`h-full w-full rounded-[2px] transition-colors ${
                      isSelected
                        ? "bg-[#d08000]"
                        : isStrikeZone
                          ? "bg-[#454545]"
                          : "bg-[#2a2a2a]"
                    }`}
                    onClick={() => onChange(isSelected ? null : course)}
                    onKeyDown={(event) => handleKeyDown(event, course)}
                  />
                );
              }}
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
      <p aria-live="polite" className="text-xs text-zinc-300">
        {value !== null ? pitchCourseLabel(value) : "未選択"}
      </p>
      {value !== null ? (
        <button
          type="button"
          className="self-start text-xs text-zinc-400 underline"
          onClick={() => onChange(null)}
        >
          クリア
        </button>
      ) : null}
    </div>
  );
}
