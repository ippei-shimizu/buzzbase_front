import { useCallback, useEffect, useState } from "react";
import MatchResultsItem from "@app/components/listItem/MatchResultsItem";
import ResultsSelectBox from "@app/components/select/ResultsSelectBox";
import { gameType, years } from "@app/data/TestData";
import {
  getFilterGameResultsV2,
  getFilterGameResultsUserIdV2,
} from "@app/services/gameResultsService";
import {
  getMatchResults,
  getMatchResultsUserId,
} from "@app/services/matchResultsService";

type GameResult = {
  game_result_id: number;
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
  const [availableYears, setAvailableYears] = useState<AvailableYear[]>([]);
  const [selectedYear, setSelectedYear] = useState("通算");
  const [availableMatchType, setAvailableMatchType] = useState<AvailableYear[]>(
    [],
  );
  const [selectedMatchType, setSelectedMatchType] = useState("全て");
  const [gameResultIndex, setGameResultIndex] = useState<GameResult[]>([]);

  const fetchFilteredData = useCallback(async () => {
    try {
      let filteredGameResultData;
      if (userId) {
        // v2: plate_appearances included in response
        filteredGameResultData = await getFilterGameResultsUserIdV2(
          userId,
          selectedYear,
          selectedMatchType,
        );
        // ユーザーごとシーズン
        const matchResultData = await getMatchResultsUserId(userId);
        const matchResultDate = matchResultData.map(
          (result: { date_and_time: string }) => result.date_and_time,
        );
        const yearArray: AvailableYear[] = matchResultDate.map(
          (dateString: string) => {
            const date = new Date(dateString);
            return date.getFullYear();
          },
        );
        const uniqueYears = Array.from(new Set(yearArray));
        uniqueYears.unshift("通算");
        setAvailableYears(uniqueYears);
        // ユーザーごと試合タイプ
        const matchTypeData: AvailableMatchType[] = matchResultData.map(
          (type: { match_type: string }) => type.match_type,
        );
        const uniqueMatchType = Array.from(new Set(matchTypeData));
        const uniqueMatchTypeChange = uniqueMatchType.map((type) => {
          if (type === "open") {
            return "オープン戦";
          } else if (type === "regular") {
            return "公式戦";
          } else {
            return type;
          }
        });
        uniqueMatchTypeChange.unshift("全て");
        setAvailableMatchType(uniqueMatchTypeChange);
      }
      if (filteredGameResultData && filteredGameResultData.length > 0) {
        filteredGameResultData.sort(
          (
            a: { match_result: { date_and_time: string } },
            b: { match_result: { date_and_time: string } },
          ) => {
            const dateA = new Date(a.match_result.date_and_time).getTime();
            const dateB = new Date(b.match_result.date_and_time).getTime();
            return dateB - dateA;
          },
        );
      }
      if (filteredGameResultData) {
        setGameResultIndex(filteredGameResultData);
      } else {
        setGameResultIndex([]);
      }
    } catch (error) {
      console.error(`Filtered game lists fetch error:`, error);
    }
  }, [userId, selectedYear, selectedMatchType]);

  useEffect(() => {
    if (userId) {
      fetchFilteredData();
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, fetchFilteredData]);

  useEffect(() => {
    if (selectedYear && selectedMatchType) {
      fetchFilteredData();
    }
  }, [selectedYear, selectedMatchType, fetchFilteredData]);

  const fetchData = async () => {
    try {
      // v2: plate_appearances included in response
      const gameResultsDataLists = await getFilterGameResultsV2(
        selectedYear,
        selectedMatchType,
      );
      const matchResultData = await getMatchResults();
      const matchResultDate = matchResultData.map(
        (result: { date_and_time: string }) => result.date_and_time,
      );
      const yearArray: AvailableYear[] = matchResultDate.map(
        (dateString: string) => {
          const date = new Date(dateString);
          return date.getFullYear();
        },
      );
      const uniqueYears = Array.from(new Set(yearArray));
      uniqueYears.unshift("通算");
      setAvailableYears(uniqueYears);

      const matchTypeData: AvailableMatchType[] = matchResultData.map(
        (type: { match_type: string }) => type.match_type,
      );
      const uniqueMatchType = Array.from(new Set(matchTypeData));
      const uniqueMatchTypeChange = uniqueMatchType.map((type) => {
        if (type === "open") {
          return "オープン戦";
        } else if (type === "regular") {
          return "公式戦";
        } else {
          return type;
        }
      });
      gameResultsDataLists.sort(
        (
          a: { match_result: { date_and_time: string } },
          b: { match_result: { date_and_time: string } },
        ) => {
          const dateA = new Date(a.match_result.date_and_time).getTime();
          const dateB = new Date(b.match_result.date_and_time).getTime();
          return dateB - dateA;
        },
      );
      uniqueMatchTypeChange.unshift("全て");
      setAvailableMatchType(uniqueMatchTypeChange);
      setGameResultIndex(gameResultsDataLists);
    } catch (error) {
      console.log(`game lists fetch error:`, error);
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  const handleMatchTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedMatchType(event.target.value);
  };
  return (
    <>
      <div className="bg-bg_sub p-4 rounded-xl lg:p-6">
        <div className="flex gap-x-4 mb-5 justify-center">
          <ResultsSelectBox
            radius="full"
            className="bg-transparent rounded-full text-xs border-zinc-400 max-w-xs"
            data={years}
            variant="faded"
            color="primary"
            ariaLabel="シーズンを選択"
            labelPlacement="outside"
            size="sm"
            onChange={handleYearChange}
            propsYears={availableYears}
            selectedKeys={selectedYear ? [selectedYear.toString()] : []}
          />
          <ResultsSelectBox
            radius="full"
            className="bg-transparent rounded-full text-xs border-zinc-400 max-w-xs"
            data={gameType}
            variant="faded"
            color="primary"
            ariaLabel="試合の種類を選択"
            labelPlacement="outside"
            size="sm"
            onChange={handleMatchTypeChange}
            propsYears={availableMatchType}
            selectedKeys={
              selectedMatchType ? [selectedMatchType.toString()] : []
            }
          />
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
        </div>
      </div>
    </>
  );
}
