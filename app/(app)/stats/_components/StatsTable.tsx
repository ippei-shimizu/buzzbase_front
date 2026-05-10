"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

interface Column<T> {
  key: keyof T;
  label: string;
  format?: (value: number) => string;
  highlight?: boolean;
  tooltip?: string;
}

interface StatsTableProps<T> {
  rows: T[];
  columns: Column<T>[];
}

function formatRate(value: number): string {
  const formatted = value.toFixed(3);
  if (value !== 0 && value < 1 && value > -1) {
    return formatted.replace(/^0/, "");
  }
  return formatted;
}

function formatEra(value: number): string {
  return value.toFixed(2);
}

const fmtInt = (v: number) => String(v);
const fmt3 = (v: number) => formatRate(v);
const fmt2 = (v: number) => formatEra(v);

export { fmt3, fmt2, fmtInt };
export type { Column };

export default function StatsTable<
  T extends { label: string; opponent?: string },
>({ rows, columns }: StatsTableProps<T>) {
  const isCareerRow = (row: T) => row.label === "通算";
  const hasOpponent = rows.some((r) => r.opponent);
  const fixedWidth = hasOpponent ? "w-[100px]" : "w-[70px]";
  const rowHeight = hasOpponent ? "h-[46px]" : "h-9";

  return (
    <div className="mb-3 relative z-0">
      <div className="flex">
        {/* 左固定列 */}
        <div
          className="z-10 shrink-0"
          style={{ borderRight: "1px solid #71717b" }}
        >
          {/* 固定列ヘッダー */}
          <div
            className={`${fixedWidth} h-[68px] flex items-end pb-2 px-2.5`}
            style={{ backgroundColor: "#27272a" }}
          >
            <span
              className="text-[11px] font-semibold"
              style={{ color: "#A1A1AA" }}
            >
              {hasOpponent ? "日付" : "年度"}
            </span>
          </div>
          {/* 固定列データ */}
          {rows.map((row, i) => {
            const career = isCareerRow(row);
            return (
              <div
                key={`${i}-${row.label}-${row.opponent ?? ""}`}
                className={`${fixedWidth} ${rowHeight} flex flex-col justify-center px-2.5`}
                style={{
                  backgroundColor: career ? "#3d2800" : "#2E2E2E",
                  borderTop: career ? "2px solid #d08000" : undefined,
                  borderBottom:
                    !career && i < rows.length - 1
                      ? "1px solid #27272a"
                      : undefined,
                }}
              >
                <span
                  className="text-[13px] font-semibold truncate"
                  style={{ color: career ? "#d08000" : "#D4D4D8" }}
                >
                  {row.label}
                </span>
                {row.opponent && !career ? (
                  <span
                    className="text-[10px] truncate mt-0.5"
                    style={{ color: "#A1A1AA" }}
                  >
                    {row.opponent}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 右スクロール領域 */}
        <div className="overflow-x-auto">
          <div>
            {/* ヘッダー */}
            <div
              className="flex min-w-max h-[68px]"
              style={{ backgroundColor: "#27272a" }}
            >
              {columns.map((col) => {
                const labelText = col.label
                  .split("")
                  .map((c) => (c === "ー" ? "｜" : c === "/" ? "／" : c))
                  .join("\n");
                const labelSpan = (
                  <span
                    className="text-center whitespace-pre-wrap"
                    style={{
                      color: "#A1A1AA",
                      fontSize: "11px",
                      fontWeight: 600,
                      lineHeight: "11px",
                    }}
                  >
                    {labelText}
                  </span>
                );
                return (
                  <div
                    key={String(col.key)}
                    className="flex items-center justify-center w-12 px-1.5"
                  >
                    {col.tooltip ? (
                      <Popover placement="bottom" showArrow>
                        <PopoverTrigger>
                          <button
                            type="button"
                            className="flex w-full items-center justify-center underline decoration-dotted decoration-zinc-500 underline-offset-2"
                          >
                            {labelSpan}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-[220px] p-3">
                          <p className="text-xs text-zinc-100 leading-snug">
                            {col.tooltip}
                          </p>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      labelSpan
                    )}
                  </div>
                );
              })}
            </div>
            {/* データ行 */}
            {rows.map((row, i) => {
              const career = isCareerRow(row);
              return (
                <div
                  key={`${i}-${row.label}-${row.opponent ?? ""}`}
                  className={`flex min-w-max items-center ${rowHeight}`}
                  style={{
                    backgroundColor: career ? "#3d2800" : undefined,
                    borderTop: career ? "2px solid #d08000" : undefined,
                    borderBottom:
                      !career && i < rows.length - 1
                        ? "1px solid #27272a"
                        : undefined,
                  }}
                >
                  {columns.map((col) => {
                    const val = row[col.key] as number;
                    const formatted = col.format
                      ? col.format(val)
                      : String(val);
                    return (
                      <div
                        key={String(col.key)}
                        className="flex items-center justify-center w-12 px-1.5"
                      >
                        <span
                          className="text-[13px]"
                          style={{
                            color: col.highlight ? "#d08000" : "#F4F4F4",
                            fontWeight: col.highlight || career ? 700 : 400,
                          }}
                        >
                          {formatted}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p
        className="text-right text-[11px] mt-0.5 pr-2"
        style={{ color: "#52525B" }}
      >
        ← スクロール →
      </p>
    </div>
  );
}
