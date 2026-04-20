"use client";

import type { BattingStatsRow, PitchingStatsRow, StatsPeriod } from "../actions";
import Link from "next/link";
import BattingStatsTable from "./BattingStatsTable";
import PitchingStatsTable from "./PitchingStatsTable";

type ActiveTab = "batting" | "pitching";

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "yearly", label: "年" },
  { value: "monthly", label: "月" },
  { value: "daily", label: "日" },
];

interface StatsContainerProps {
  tab: ActiveTab;
  period: StatsPeriod;
  rows: BattingStatsRow[] | PitchingStatsRow[];
}

export default function StatsContainer({
  tab,
  period,
  rows,
}: StatsContainerProps) {
  return (
    <div>
      {/* タブバー */}
      <div className="flex" style={{ borderBottom: "1px solid #424242" }}>
        <Link
          href={`/stats?tab=batting&period=${period}`}
          className="flex-1 py-3 text-center text-sm font-semibold"
          style={{
            borderBottom:
              tab === "batting"
                ? "2px solid #d08000"
                : "2px solid transparent",
            color: tab === "batting" ? "#F4F4F4" : "#A1A1AA",
          }}
        >
          打撃
        </Link>
        <Link
          href={`/stats?tab=pitching&period=${period}`}
          className="flex-1 py-3 text-center text-sm font-semibold"
          style={{
            borderBottom:
              tab === "pitching"
                ? "2px solid #d08000"
                : "2px solid transparent",
            color: tab === "pitching" ? "#F4F4F4" : "#A1A1AA",
          }}
        >
          投球
        </Link>
      </div>

      {/* 期間トグル */}
      <div className="flex justify-end mt-4 mb-2">
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{ backgroundColor: "#3A3A3A" }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/stats?tab=${tab}&period=${opt.value}`}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  period === opt.value ? "#d08000" : "transparent",
                color: period === opt.value ? "#F4F4F4" : "#A1A1AA",
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* テーブル */}
      {tab === "batting" ? (
        <BattingStatsTable rows={rows as BattingStatsRow[]} />
      ) : (
        <PitchingStatsTable rows={rows as PitchingStatsRow[]} />
      )}
      {/* フッターナビとの余白 */}
      <div className="h-24 lg:h-0" />
    </div>
  );
}
