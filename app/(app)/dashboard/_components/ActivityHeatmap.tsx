"use client";

import type { ActivityLog } from "@app/types/activity";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays } from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import {
  ACTIVITY_LEVEL_COLORS,
  ACTIVITY_LEVEL_LABELS,
} from "@app/constants/activity";
import {
  WEEKDAY_ROW_LABELS,
  buildHeatmapColumns,
  columnIndexOf,
  describeActivityCell,
  indexLogsByDate,
} from "../_utils/heatmapGrid";
import {
  CAPTION_PLACEHOLDER,
  HEATMAP_LABEL,
  LEGEND_LABEL,
} from "./activityCopy";

/** マスの一辺と間隔（px）。自動スクロール位置の計算にも使うため JS 側で持つ。 */
const CELL_SIZE = 12;
const CELL_GAP = 3;
const COLUMN_WIDTH = CELL_SIZE + CELL_GAP;
const WEEKDAY_COLUMN_WIDTH = 22;

interface ActivityHeatmapProps {
  /** 表示範囲の開始日。back がクランプした後の値を渡すこと。 */
  from: string;
  /** 表示範囲の終了日。 */
  to: string;
  logs: ActivityLog[];
  /** Asia/Tokyo の今日。初期表示位置と「今日」の強調に使う。 */
  today: string;
}

const levelColor = (level: number): string =>
  ACTIVITY_LEVEL_COLORS[level] ?? ACTIVITY_LEVEL_COLORS[0];

/**
 * GitHub 風のアクティビティヒートマップ。週を列、曜日を行として描く。
 *
 * 色の濃さは活動量の段階を表すが、濃淡だけでは読み取れないユーザーがいるため、
 * 各マスの aria-label とキャプション、凡例に段階の言葉を必ず添える。
 */
export default function ActivityHeatmap({
  from,
  to,
  logs,
  today,
}: ActivityHeatmapProps) {
  const columns = useMemo(() => buildHeatmapColumns(from, to), [from, to]);
  const logByDate = useMemo(() => indexLogsByDate(logs), [logs]);

  // 今日が範囲内ならその日、外なら範囲の末日を初期位置にする。
  const anchorDate = today >= from && today <= to ? today : to;
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState(anchorDate);

  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusColumnIndex = columnIndexOf(columns, anchorDate);

  // 初期表示で今日の列が見えるよう横スクロールする。
  // scrollIntoView や focus() ではなく scrollLeft を直接動かすことで、
  // キーボードのフォーカス位置とスクリーンリーダーの読み上げ位置を奪わない。
  useEffect(() => {
    const node = scrollRef.current;
    if (node === null) return;
    const columnCenter = focusColumnIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2;
    node.scrollLeft = Math.max(0, columnCenter - node.clientWidth / 2);
  }, [focusColumnIndex]);

  const captionFor = (date: string): string =>
    describeActivityCell(date, logByDate.get(date) ?? null);

  const moveFocus = (fromDate: string, days: number) => {
    const target = addDays(fromDate, days);
    if (target < from || target > to) return;
    setFocusedDate(target);
    setActiveDate(target);
    cellRefs.current.get(target)?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    date: string,
  ) => {
    // 列 = 1週間なので、左右は 7 日、上下は 1 日ぶん動かす。
    const step: Record<string, number> = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
    };
    const days = step[event.key];
    if (days === undefined) return;
    event.preventDefault();
    moveFocus(date, days);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={scrollRef}
        // スクロールできる領域はキーボードでも操作できる必要があるため、フォーカス可能にする。
        tabIndex={0}
        role="group"
        aria-label={HEATMAP_LABEL}
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000]"
      >
        <div className="inline-flex flex-col">
          <div
            aria-hidden
            className="flex"
            style={{ paddingLeft: WEEKDAY_COLUMN_WIDTH }}
          >
            {columns.map((column, index) => (
              <span
                key={index}
                className="text-[9px] leading-none text-zic-400"
                style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}
              >
                {column.monthLabel}
              </span>
            ))}
          </div>

          <div className="flex">
            <div
              aria-hidden
              className="flex flex-col"
              style={{ width: WEEKDAY_COLUMN_WIDTH }}
            >
              {WEEKDAY_ROW_LABELS.map((label, index) => (
                <span
                  key={index}
                  className="flex items-center text-[9px] leading-none text-zic-400"
                  style={{ height: COLUMN_WIDTH }}
                >
                  {label}
                </span>
              ))}
            </div>

            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col">
                {column.cells.map((cell, rowIndex) => {
                  if (cell.date === null) {
                    return (
                      <span
                        key={`empty-${rowIndex}`}
                        aria-hidden
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          margin: CELL_GAP / 2,
                        }}
                      />
                    );
                  }
                  const date = cell.date;
                  const log = logByDate.get(date) ?? null;
                  const isToday = date === today;
                  return (
                    <button
                      key={date}
                      type="button"
                      ref={(node) => {
                        if (node) cellRefs.current.set(date, node);
                        else cellRefs.current.delete(date);
                      }}
                      // 1年ぶんのマスをすべてタブ順に載せると移動が終わらないため、
                      // フォーカスは 1 つだけに持たせて矢印キーで移動させる。
                      tabIndex={date === focusedDate ? 0 : -1}
                      aria-label={captionFor(date)}
                      title={captionFor(date)}
                      onClick={() => {
                        setActiveDate(date);
                        setFocusedDate(date);
                      }}
                      onMouseEnter={() => setActiveDate(date)}
                      onFocus={() => setActiveDate(date)}
                      onKeyDown={(event) => handleKeyDown(event, date)}
                      className={`rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        date === activeDate ? "ring-1 ring-white" : ""
                      } ${isToday ? "ring-1 ring-[#d08000]" : ""}`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        margin: CELL_GAP / 2,
                        backgroundColor: levelColor(log?.intensity_level ?? 0),
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="text-xs text-zic-300">
        {activeDate === null ? CAPTION_PLACEHOLDER : captionFor(activeDate)}
      </p>

      {/* 濃淡だけでなく言葉でも段階が分かるよう、凡例にラベルを併記する。 */}
      <ul
        aria-label={LEGEND_LABEL}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zic-400"
      >
        {ACTIVITY_LEVEL_LABELS.map((label, level) => (
          <li key={label} className="flex items-center gap-1">
            <span
              aria-hidden
              className="inline-block rounded-[2px]"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: levelColor(level),
              }}
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
