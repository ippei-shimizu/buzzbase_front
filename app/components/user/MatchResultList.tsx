"use client";

import type {
  FilterOption,
  FilterValues,
} from "@app/components/filter/filterTypes";
import type { SeasonData, TournamentData } from "@app/interface";
import type { PaginationInfo } from "@app/services/gameResultsService";
import { useCallback, useEffect, useRef, useState } from "react";
import AdInFeed from "@app/components/ad/AdInFeed";
import FilterBar from "@app/components/filter/FilterBar";
import { monthOptionsFromRecorded } from "@app/components/filter/monthOptions";
import { yearOptionsFrom } from "@app/components/filter/yearOptions";
import GamePagination from "@app/components/game/GamePagination";
import GameSearchInput from "@app/components/game/GameSearchInput";
import GameSortSelect from "@app/components/game/GameSortSelect";
import MatchResultsItem from "@app/components/listItem/MatchResultsItem";
import SkeletonList from "@app/components/loading/SkeletonList";
import {
  getFilterGameResultsV2,
  getFilterGameResultsUserIdV2,
} from "@app/services/gameResultsService";
import {
  getAvailableMonths,
  getMatchResults,
  getMatchResultsUserId,
} from "@app/services/matchResultsService";
import { getSeasons } from "@app/services/seasonsService";
import { getUserTournaments } from "@app/services/tournamentsService";

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

type MatchResultListProps = UserId & {
  adSlot?: string;
  adLayoutKey?: string;
};

const MATCH_TYPE_LABELS: Record<string, string> = {
  regular: "公式戦",
  open: "オープン戦",
};

/** 記録済みの試合から、実際に存在する年度と試合種別だけを選択肢として抽出する。 */
function buildRecordedOptions(
  matchResults: { date_and_time: string; match_type: string }[],
): { years: FilterOption[]; matchTypes: FilterOption[] } {
  const years = Array.from(
    new Set(
      matchResults.map((result) =>
        new Date(result.date_and_time).getFullYear(),
      ),
    ),
  );
  const matchTypes = Array.from(
    new Set(matchResults.map((result) => result.match_type)),
  );
  return {
    years: yearOptionsFrom(years),
    matchTypes: matchTypes.map((matchType) => ({
      key: matchType,
      label: MATCH_TYPE_LABELS[matchType] ?? matchType,
    })),
  };
}

export default function MatchResultList(props: MatchResultListProps) {
  const { userId, adSlot, adLayoutKey } = props;
  const [filters, setFilters] = useState<FilterValues>({});
  const [yearOptions, setYearOptions] = useState<FilterOption[]>([]);
  const [matchTypeOptions, setMatchTypeOptions] = useState<FilterOption[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<FilterOption[]>([]);
  const [tournamentOptions, setTournamentOptions] = useState<FilterOption[]>(
    [],
  );
  const [monthOptions, setMonthOptions] = useState<FilterOption[]>([]);
  const [gameResultIndex, setGameResultIndex] = useState<GameResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
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

  // フィルタの選択肢は初回のみ取得する（互いに独立するため並列で投げる）。
  useEffect(() => {
    let cancelled = false;
    const fetchFilterOptions = async () => {
      const [matchResults, seasons, tournaments, months] = await Promise.all([
        (userId ? getMatchResultsUserId(userId) : getMatchResults()).catch(
          () => [],
        ),
        getSeasons(userId).catch(() => []),
        getUserTournaments(userId),
        getAvailableMonths(userId),
      ]);
      if (cancelled) return;
      const recorded = buildRecordedOptions(matchResults);
      setYearOptions(recorded.years);
      setMatchTypeOptions(recorded.matchTypes);
      setSeasonOptions(
        seasons.map((season: SeasonData) => ({
          key: String(season.id),
          label: season.name,
        })),
      );
      setTournamentOptions(
        tournaments.map((tournament: TournamentData) => ({
          key: String(tournament.id),
          label: tournament.name,
        })),
      );
      setMonthOptions(monthOptionsFromRecorded(months));
    };
    fetchFilterOptions();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // フィルター変更時にページを1にリセットするラッパー
  const handleFiltersChange = (next: FilterValues) => {
    setFilters(next);
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

  // ソートパラメータ（デフォルトの場合はundefinedにしてパラメータを省略）
  const isCustomSort = sortBy !== "date" || sortOrder !== "desc";
  const apiSortBy = isCustomSort ? sortBy : undefined;
  const apiSortOrder = isCustomSort ? sortOrder : undefined;

  // フィルタ結果取得（フィルタ条件変更時・ページ変更時に再実行）
  useEffect(() => {
    let cancelled = false;
    const fetchFilteredData = async () => {
      setIsLoading(true);
      try {
        const params = {
          ...filters,
          page: currentPage,
          search: debouncedSearch || undefined,
          sortBy: apiSortBy,
          sortOrder: apiSortOrder,
        };
        const response = userId
          ? await getFilterGameResultsUserIdV2(userId, params)
          : await getFilterGameResultsV2(params);
        if (cancelled) return;
        setGameResultIndex((response.data as GameResult[]) || []);
        setPaginationInfo(response.pagination);
      } catch (error) {
        if (!cancelled) {
          console.error("Filtered game lists fetch error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchFilteredData();
    return () => {
      cancelled = true;
    };
  }, [userId, filters, currentPage, debouncedSearch, apiSortBy, apiSortOrder]);

  return (
    <>
      <div ref={listTopRef} className="bg-bg_sub p-4 rounded-xl lg:p-6">
        <div className="mb-5 overflow-hidden flex flex-col gap-3">
          <FilterBar
            values={filters}
            onChange={handleFiltersChange}
            options={{
              years: yearOptions,
              months: monthOptions,
              matchTypes: matchTypeOptions,
              seasons: seasonOptions,
              tournaments: tournamentOptions,
            }}
          />
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
            {isLoading ? (
              <SkeletonList
                count={paginationInfo?.per_page ?? 4}
                itemClassName="h-36 w-full"
                rounded="rounded-xl"
              />
            ) : gameResultIndex.length > 0 ? (
              <>
                <MatchResultsItem gameResult={gameResultIndex.slice(0, 5)} />
                {adSlot && gameResultIndex.length > 5 && (
                  <AdInFeed slot={adSlot} layoutKey={adLayoutKey} />
                )}
                {gameResultIndex.length > 5 && (
                  <MatchResultsItem gameResult={gameResultIndex.slice(5)} />
                )}
              </>
            ) : (
              <p className="text-sm text-zinc-400 text-center pb-3">
                試合結果はありません。
              </p>
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
