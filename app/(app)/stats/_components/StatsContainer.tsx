"use client";

import type {
  BattingStatsRow,
  PitchingStatsRow,
  StatsPeriod,
} from "../actions";
import type {
  FilterOption,
  FilterValues,
} from "@app/components/filter/filterTypes";
import { type ReactNode, useEffect, useRef, useState } from "react";
import FilterBar from "@app/components/filter/FilterBar";
import { buildRecentYearOptions } from "@app/components/filter/yearOptions";
import { getBattingStats, getPitchingStats } from "../actions";
import BattingStatsTable from "./BattingStatsTable";
import PitchingStatsTable from "./PitchingStatsTable";

type ActiveTab = "batting" | "pitching";

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "yearly", label: "年" },
  { value: "monthly", label: "月" },
  { value: "daily", label: "日" },
];

const CURRENT_YEAR = String(new Date().getFullYear());

// 月/日表示の既定は「当年」。クリアで全期間（＝全期間の月別テーブル）に落とさないよう、
// FilterBar のリセット先にもこれを渡す。
const PERIODIC_DEFAULT_FILTERS: FilterValues = { year: CURRENT_YEAR };

interface StatsContainerProps {
  /** SSR で取得した打撃・年別の初期行。マウント時はこれを使い再取得しない。 */
  initialRows: BattingStatsRow[];
  /** 打撃タブの分析セクション（SSR + Suspense ストリーミングの Server サブツリー）。 */
  analysisSlot: ReactNode;
  /** 投手タブの分析セクション（同上）。 */
  pitchingAnalysisSlot: ReactNode;
  /** サーバーで取得したシーズン/大会/年月のフィルタ選択肢。 */
  seasonOptions: FilterOption[];
  tournamentOptions: FilterOption[];
  monthOptions: FilterOption[];
}

export default function StatsContainer({
  initialRows,
  analysisSlot,
  pitchingAnalysisSlot,
  seasonOptions,
  tournamentOptions,
  monthOptions,
}: StatsContainerProps) {
  const [tab, setTab] = useState<ActiveTab>("batting");
  const [period, setPeriod] = useState<StatsPeriod>("yearly");
  // テーブル系エンドポイントは種別を受け取らないため、種別チップは出さない。
  const [tableFilters, setTableFilters] = useState<
    Omit<FilterValues, "matchType">
  >({});
  const [battingRows, setBattingRows] =
    useState<BattingStatsRow[]>(initialRows);
  const [pitchingRows, setPitchingRows] = useState<PitchingStatsRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [yearOptions] = useState(buildRecentYearOptions);

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
    void fetcher(period, tableFilters).then((rows) => {
      if (!active) return;
      if (tab === "batting") setBattingRows(rows as BattingStatsRow[]);
      else setPitchingRows(rows as PitchingStatsRow[]);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [tab, period, tableFilters]);

  const handlePeriodChange = (next: StatsPeriod) => {
    setPeriod(next);
    // 月/日表示にしたとき期間の絞り込みが無ければ今年で絞る（全期間の月別は煩雑なため）。
    if (
      next !== "yearly" &&
      !tableFilters.year &&
      !tableFilters.seasonId &&
      !tableFilters.startMonth &&
      !tableFilters.endMonth
    ) {
      setTableFilters((prev) => ({ ...prev, ...PERIODIC_DEFAULT_FILTERS }));
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

      {/* テーブル専用フィルタ（年/月以外＝年度/月範囲/シーズン/大会で絞る） */}
      {showTableFilters ? (
        <div className="mb-3">
          <FilterBar
            values={tableFilters}
            onChange={setTableFilters}
            resetTo={PERIODIC_DEFAULT_FILTERS}
            options={{
              years: yearOptions,
              months: monthOptions,
              seasons: seasonOptions,
              tournaments: tournamentOptions,
            }}
          />
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
