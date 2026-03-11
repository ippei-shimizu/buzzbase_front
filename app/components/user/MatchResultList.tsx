"use client";

import type { SeasonData } from "@app/interface";
import type { PaginationInfo } from "@app/services/gameResultsService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FilterChip from "@app/components/filter/FilterChip";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
import GamePagination from "@app/components/game/GamePagination";
import GameSearchInput from "@app/components/game/GameSearchInput";
import GameSortSelect from "@app/components/game/GameSortSelect";
import MatchResultsItem from "@app/components/listItem/MatchResultsItem";
import {
  getFilterGameResultsV2,
  getFilterGameResultsUserIdV2,
} from "@app/services/gameResultsService";
import {
  getMatchResults,
  getMatchResultsUserId,
} from "@app/services/matchResultsService";
import { getSeasons } from "@app/services/seasonsService";

type GameResult = {
  game_result_id: number;
  season_name?: string | null;
  match_result?: {
    match_type: string;
    date_and_time: string;
    opponent_team_id: number;
    opponent_team_name?: string;
    tournament_id: number | null;
    tournament_name?: string;
    my_team_score: number;
    opponent_team_score: number;
  };
  plate_appearances?: {
    id: number;
    batting_result: string;
    game_result_id: number;
    batter_box_number: number;
  }[];
  pitching_result?: {
    innings_pitched: number;
    run_allowed: number;
    win: number;
    loss: number;
  };
};

type UserId = {
  userId: number;
};

type AvailableYear = number | string;

type AvailableMatchType = string;

export default function MatchResultList(props: UserId) {
  const { userId } = props;
  const [yearOptions, setYearOptions] = useState<
    { key: string; label: string }[]
  >([{ key: "通算", label: "通算" }]);
  const [selectedYear, setSelectedYear] = useState("通算");
  const [matchTypeOptions, setMatchTypeOptions] = useState<
    { key: string; label: string }[]
  >([{ key: "全て", label: "全て" }]);
  const [selectedMatchType, setSelectedMatchType] = useState("全て");
  const [seasonsData, setSeasonsData] = useState<SeasonData[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<
    { key: string; label: string }[]
  >([{ key: "全て", label: "全て" }]);
  const [selectedSeason, setSelectedSeason] = useState("全て");
  const [gameResultIndex, setGameResultIndex] = useState<GameResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null,
  );

  const listTopRef = useRef<HTMLDivElement>(null);

  // デバウンス処理: 検索入力の300ms遅延
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    listTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // シーズンデータは初回のみ取得（userId依存）
  useEffect(() => {
    if (!userId) return;
    const fetchSeasons = async () => {
      try {
        const seasonsList = await getSeasons(userId);
        setSeasonsData(seasonsList);
        const opts = [
          { key: "全て", label: "全て" },
          ...seasonsList.map((s: SeasonData) => ({
            key: s.name,
            label: s.name,
          })),
        ];
        setSeasonOptions(opts);
      } catch (error) {
        console.error("Failed to fetch seasons:", error);
      }
    };
    fetchSeasons();
  }, [userId]);

  // seasonId を useMemo で安定的に計算
  const seasonId = useMemo(() => {
    return selectedSeason !== "全て"
      ? seasonsData.find((s) => s.name === selectedSeason)?.id
      : undefined;
  }, [selectedSeason, seasonsData]);

  // 年度・試合タイプ一覧は初回のみ取得（userId依存）
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        let matchResultData;
        if (userId) {
          matchResultData = await getMatchResultsUserId(userId);
        } else {
          matchResultData = await getMatchResults();
        }
        // 年度抽出
        const yearArray: AvailableYear[] = matchResultData.map(
          (result: { date_and_time: string }) =>
            new Date(result.date_and_time).getFullYear(),
        );
        const uniqueYears = Array.from(new Set(yearArray));
        const yOpts = [
          { key: "通算", label: "通算" },
          ...uniqueYears.map((y) => ({ key: String(y), label: String(y) })),
        ];
        setYearOptions(yOpts);
        // 試合タイプ抽出（keyにAPI値、labelに日本語）
        const matchTypeData: AvailableMatchType[] = matchResultData.map(
          (type: { match_type: string }) => type.match_type,
        );
        const uniqueMatchTypes = Array.from(new Set(matchTypeData));
        const matchTypeLabels: Record<string, string> = {
          regular: "公式戦",
          open: "オープン戦",
        };
        const mtOpts = [
          { key: "全て", label: "全て" },
          ...uniqueMatchTypes.map((t) => ({
            key: t,
            label: matchTypeLabels[t] ?? t,
          })),
        ];
        setMatchTypeOptions(mtOpts);
      } catch (error) {
        console.error("Failed to fetch meta:", error);
      }
    };
    fetchMeta();
  }, [userId]);

  // API送信用の値
  const apiYear = selectedYear === "通算" ? "通算" : selectedYear;
  const apiMatchType =
    selectedMatchType === "全て" ? "全て" : selectedMatchType;

  // フィルター変更時にページを1にリセットするラッパー
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };
  const handleMatchTypeChange = (value: string) => {
    setSelectedMatchType(value);
    setCurrentPage(1);
  };
  const handleSeasonChange = (value: string) => {
    setSelectedSeason(value);
    setCurrentPage(1);
  };
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // フィルタ結果取得（フィルタ条件変更時・ページ変更時に再実行）
  useEffect(() => {
    let cancelled = false;
    const fetchFilteredData = async () => {
      try {
        let response;
        if (userId) {
          response = await getFilterGameResultsUserIdV2(
            userId,
            apiYear,
            apiMatchType,
            seasonId,
            currentPage,
            undefined,
            debouncedSearch || undefined,
            sortBy !== "date" || sortOrder !== "desc" ? sortBy : undefined,
            sortBy !== "date" || sortOrder !== "desc" ? sortOrder : undefined,
          );
        } else {
          response = await getFilterGameResultsV2(
            apiYear,
            apiMatchType,
            seasonId,
            currentPage,
            undefined,
            debouncedSearch || undefined,
            sortBy !== "date" || sortOrder !== "desc" ? sortBy : undefined,
            sortBy !== "date" || sortOrder !== "desc" ? sortOrder : undefined,
          );
        }
        if (cancelled) return;
        setGameResultIndex((response.data as GameResult[]) || []);
        setPaginationInfo(response.pagination);
      } catch (error) {
        if (!cancelled) {
          console.error("Filtered game lists fetch error:", error);
        }
      }
    };
    fetchFilteredData();
    return () => {
      cancelled = true;
    };
  }, [
    userId,
    apiYear,
    apiMatchType,
    seasonId,
    currentPage,
    debouncedSearch,
    sortBy,
    sortOrder,
  ]);

  return (
    <>
      <div ref={listTopRef} className="bg-bg_sub p-4 rounded-xl lg:p-6">
        <div className="mb-5 overflow-hidden flex flex-col gap-3">
          <FilterChipGroup>
            <FilterChip
              label="年度"
              value={selectedYear}
              defaultValue="通算"
              options={yearOptions}
              onChange={handleYearChange}
            />
            <FilterChip
              label="種別"
              value={selectedMatchType}
              defaultValue="全て"
              options={matchTypeOptions}
              onChange={handleMatchTypeChange}
            />
            <FilterChip
              label="シーズン"
              value={selectedSeason}
              defaultValue="全て"
              options={seasonOptions}
              onChange={handleSeasonChange}
            />
          </FilterChipGroup>
          <div className="flex items-center gap-2">
            <GameSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <GameSortSelect
              sortBy={sortBy}
              sortOrder={sortOrder}
              onChange={handleSortChange}
            />
          </div>
        </div>
        <div className="mt-8">
          <div className="mt-8 grid gap-y-5">
            {gameResultIndex.length > 0 ? (
              <>
                <MatchResultsItem gameResult={gameResultIndex} />
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-400 text-center pb-3">
                  試合結果はありません。
                </p>
              </>
            )}
          </div>
          {paginationInfo && (
            <GamePagination
              currentPage={paginationInfo.current_page}
              totalPages={paginationInfo.total_pages}
              totalCount={paginationInfo.total_count}
              perPage={paginationInfo.per_page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
