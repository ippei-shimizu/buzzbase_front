"use client";

import type {
  BattingStatsRow,
  PitchingStatsRow,
  StatsPeriod,
} from "../actions";
import { type ReactNode, useEffect, useRef, useState } from "react";
import FilterChip from "@app/components/filter/FilterChip";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
import { getBattingStats, getPitchingStats } from "../actions";
import { DEFAULT_OPTION, type FilterOption } from "../statsFilterOption";
import BattingStatsTable from "./BattingStatsTable";
import PitchingStatsTable from "./PitchingStatsTable";

type ActiveTab = "batting" | "pitching";

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "yearly", label: "年" },
  { value: "monthly", label: "月" },
  { value: "daily", label: "日" },
];

function buildYearOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption[] = [DEFAULT_OPTION];
  for (let offset = 0; offset < 6; offset += 1) {
    const year = String(currentYear - offset);
    options.push({ key: year, label: year });
  }
  return options;
}

const CURRENT_YEAR = String(new Date().getFullYear());

interface StatsContainerProps {
  /** SSR で取得した打撃・年別の初期行。マウント時はこれを使い再取得しない。 */
  initialRows: BattingStatsRow[];
  /** 打撃タブの分析セクション（SSR + Suspense ストリーミングの Server サブツリー）。 */
  analysisSlot: ReactNode;
  /** 投手タブの分析セクション（同上）。 */
  pitchingAnalysisSlot: ReactNode;
  /** サーバーで取得したシーズン/大会のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
}

export default function StatsContainer({
  initialRows,
  analysisSlot,
  pitchingAnalysisSlot,
  seasonOptions,
  tournamentOptions,
}: StatsContainerProps) {
  const [tab, setTab] = useState<ActiveTab>("batting");
  const [period, setPeriod] = useState<StatsPeriod>("yearly");
  const [tableYear, setTableYear] = useState<string | undefined>(undefined);
  const [tableSeasonId, setTableSeasonId] = useState<string | undefined>(
    undefined,
  );
  const [tableTournamentId, setTableTournamentId] = useState<
    string | undefined
  >(undefined);
  const [battingRows, setBattingRows] =
    useState<BattingStatsRow[]>(initialRows);
  const [pitchingRows, setPitchingRows] = useState<PitchingStatsRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [yearOptions] = useState(buildYearOptions);

  // 初回マウントは SSR の initialRows（打撃/年別）を使うため取得しない。
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    const fetcher = tab === "batting" ? getBattingStats : getPitchingStats;
    void fetcher(period, tableYear, tableSeasonId, tableTournamentId).then(
      (rows) => {
        if (!active) return;
        if (tab === "batting") setBattingRows(rows as BattingStatsRow[]);
        else setPitchingRows(rows as PitchingStatsRow[]);
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [tab, period, tableYear, tableSeasonId, tableTournamentId]);

  const handlePeriodChange = (next: StatsPeriod) => {
    setPeriod(next);
    // 月/日表示にしたとき年度/シーズン未指定なら今年で絞る（全期間の月別は煩雑なため）。
    if (next !== "yearly" && !tableYear && !tableSeasonId) {
      setTableYear(CURRENT_YEAR);
    }
  };

  const showTableFilters = period !== "yearly";

  return (
    <div>
      {/* タブバー */}
      <div className="flex" style={{ borderBottom: "1px solid #424242" }}>
        <button
          type="button"
          onClick={() => setTab("batting")}
          className="flex-1 py-3 text-center text-sm font-semibold"
          style={{
            borderBottom:
              tab === "batting" ? "2px solid #d08000" : "2px solid transparent",
            color: tab === "batting" ? "#F4F4F4" : "#A1A1AA",
          }}
        >
          打撃
        </button>
        <button
          type="button"
          onClick={() => setTab("pitching")}
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
        </button>
      </div>

      {/* 分析セクションはタブ切替で非表示にするだけにし、アンマウントによる
          フィルタ state のリセットを防ぐ（条件 null だと往復で初期値に戻る）。 */}
      <div className={tab === "batting" ? "mt-5" : "hidden"}>
        {analysisSlot}
      </div>
      <div className={tab === "pitching" ? "mt-5" : "hidden"}>
        {pitchingAnalysisSlot}
      </div>

      {/* 期間トグル */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <p className="text-base font-bold">
          {tab === "batting" ? "打撃成績" : "投球成績"}
        </p>
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{ backgroundColor: "#3A3A3A" }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePeriodChange(opt.value)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  period === opt.value ? "#d08000" : "transparent",
                color: period === opt.value ? "#F4F4F4" : "#A1A1AA",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* テーブル専用フィルタ（年/月以外＝年度/シーズン/大会で絞る） */}
      {showTableFilters ? (
        <div className="mb-3 flex justify-end">
          <FilterChipGroup>
            <FilterChip
              label="年度"
              value={tableYear ?? "全て"}
              defaultValue="全て"
              options={yearOptions}
              onChange={(key) => setTableYear(key === "全て" ? undefined : key)}
            />
            {seasonOptions.length > 1 ? (
              <FilterChip
                label="シーズン"
                value={tableSeasonId ?? "全て"}
                defaultValue="全て"
                options={seasonOptions}
                onChange={(key) =>
                  setTableSeasonId(key === "全て" ? undefined : key)
                }
              />
            ) : null}
            {tournamentOptions.length > 1 ? (
              <FilterChip
                label="大会"
                value={tableTournamentId ?? "全て"}
                defaultValue="全て"
                options={tournamentOptions}
                onChange={(key) =>
                  setTableTournamentId(key === "全て" ? undefined : key)
                }
              />
            ) : null}
          </FilterChipGroup>
        </div>
      ) : null}

      {/* テーブル（取得中は薄く表示する） */}
      <div className={isLoading ? "opacity-50 transition-opacity" : undefined}>
        {tab === "batting" ? (
          <BattingStatsTable rows={battingRows} />
        ) : (
          <PitchingStatsTable rows={pitchingRows} />
        )}
      </div>
      {/* フッターナビとの余白 */}
      <div className="h-24 lg:h-0" />
    </div>
  );
}
