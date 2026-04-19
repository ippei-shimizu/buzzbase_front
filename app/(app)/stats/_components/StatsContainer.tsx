"use client";

import type {
  BattingStatsRow,
  PitchingStatsRow,
  StatsPeriod,
} from "../actions";
import { useEffect, useState } from "react";
import { getBattingStats, getPitchingStats } from "../actions";
import BattingStatsTable from "./BattingStatsTable";
import PeriodToggle from "./PeriodToggle";
import PitchingStatsTable from "./PitchingStatsTable";

type ActiveTab = "batting" | "pitching";

export default function StatsContainer() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("batting");
  const [period, setPeriod] = useState<StatsPeriod>("yearly");
  const [battingRows, setBattingRows] = useState<BattingStatsRow[]>([]);
  const [pitchingRows, setPitchingRows] = useState<PitchingStatsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      setIsLoading(true);
      if (activeTab === "batting") {
        const rows = await getBattingStats(period);
        if (!cancelled) setBattingRows(rows);
      } else {
        const rows = await getPitchingStats(period);
        if (!cancelled) setPitchingRows(rows);
      }
      if (!cancelled) setIsLoading(false);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [activeTab, period]);

  return (
    <div>
      {/* タブバー（モバイル準拠） */}
      <div className="flex" style={{ borderBottom: "1px solid #424242" }}>
        <button
          onClick={() => setActiveTab("batting")}
          className="flex-1 py-3 text-center text-sm font-semibold"
          style={{
            borderBottom:
              activeTab === "batting"
                ? "2px solid #d08000"
                : "2px solid transparent",
            color: activeTab === "batting" ? "#F4F4F4" : "#A1A1AA",
          }}
        >
          打撃
        </button>
        <button
          onClick={() => setActiveTab("pitching")}
          className="flex-1 py-3 text-center text-sm font-semibold"
          style={{
            borderBottom:
              activeTab === "pitching"
                ? "2px solid #d08000"
                : "2px solid transparent",
            color: activeTab === "pitching" ? "#F4F4F4" : "#A1A1AA",
          }}
        >
          投球
        </button>
      </div>

      {/* 期間トグル */}
      <div className="flex justify-end mt-4 mb-2">
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {/* テーブル */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: "#d08000", borderTopColor: "transparent" }}
          />
        </div>
      ) : activeTab === "batting" ? (
        <BattingStatsTable rows={battingRows} />
      ) : (
        <PitchingStatsTable rows={pitchingRows} />
      )}
      {/* フッターナビとの余白 */}
      <div className="h-24 lg:h-0" />
    </div>
  );
}
