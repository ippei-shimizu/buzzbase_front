"use client";
import type {
  BattingAverage,
  MatchResult,
  PitchingResult,
  PlateAppearanceSummary,
} from "@app/interface";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { Chip, Divider } from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import AppearanceTypeBadge from "@app/components/chip/AppearanceTypeBadge";
import SummaryResultHeader from "@app/components/header/SummaryHeader";
import ResultShareComponent from "@app/components/share/ResultShareComponent";
import { getCurrentBattingAverage } from "@app/services/battingAveragesService";
import { getCurrentMatchResult } from "@app/services/matchResultsService";
import { getCurrentPitchingResult } from "@app/services/pitchingResultsService";
import { getCurrentPlateAppearance } from "@app/services/plateAppearanceService";
import { getPositionName } from "@app/services/positionService";
import { getTeamName } from "@app/services/teamsService";
import { getTournamentName } from "@app/services/tournamentsService";
import {
  getCurrentUserId,
  getCurrentUsersUserId,
} from "@app/services/userService";
import { getPlateAppearancesByGame } from "@app/services/v2/plateAppearanceService";
import {
  getBattingResultColor,
  HIT_RESULT_COLOR,
} from "@app/utils/battingResultColor";
import { PlateAppearanceSummaryCard } from "./_components/PlateAppearanceSummaryCard";

type MatchResultDisplay = MatchResult & {
  id: number;
  match_type: string;
  date_and_time: string;
  batting_order: string;
  memo?: string | null;
  tournament_name?: string;
  my_team_name?: string;
  season_name?: string | null;
};

type BattingAverageDisplay = BattingAverage;

const battingOrder = [
  { id: 1, turn: "1番" },
  { id: 2, turn: "2番" },
  { id: 3, turn: "3番" },
  { id: 4, turn: "4番" },
  { id: 5, turn: "5番" },
  { id: 6, turn: "6番" },
  { id: 7, turn: "7番" },
  { id: 8, turn: "8番" },
  { id: 9, turn: "9番" },
];

export default function ResultsSummary() {
  const [matchResult, setMatchResult] = useState<MatchResultDisplay[]>([]);
  const [plateAppearance, setPlateAppearance] = useState<
    PlateAppearanceSummary[]
  >([]);
  const [plateAppearancesV2, setPlateAppearancesV2] = useState<
    PlateAppearanceV2[]
  >([]);
  const [battingAverage, setBattingAverage] = useState<BattingAverage[]>([]);
  const [pitchingResult, setPitchingResult] = useState<PitchingResult[]>([]);
  const [isDetailDataFetched, setIsDetailDataFetched] = useState(false);
  const [currentUsersUserId, setCurrentUsersUserId] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [memo, setMemo] = useState<string>("");
  const [localStorageGameResultId, setLocalStorageGameResultId] = useState<
    number | null
  >(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMatchResultDetailData = async () => {
    const updateMatchResults = await Promise.all(
      matchResult.map(async (match) => {
        const [tournamentName, myTeamName, opponentTeam, positionName] =
          await Promise.all([
            getTournamentName(match.tournament_id),
            getTeamName(match.my_team_id),
            getTeamName(match.opponent_team_id),
            getPositionName(Number(match.defensive_position)),
          ]);
        return {
          ...match,
          tournament_name: tournamentName,
          my_team_name: myTeamName,
          opponent_team_name: opponentTeam,
          defensive_position: positionName,
        };
      }),
    );
    setMatchResult(updateMatchResults);
    setIsDetailDataFetched(true);
  };

  useEffect(() => {
    // ローカルストレージからid取得
    const savedGameResultId = localStorage.getItem("gameResultId");
    if (savedGameResultId) {
      setLocalStorageGameResultId(JSON.parse(savedGameResultId));
      fetchCurrentResultData(JSON.parse(savedGameResultId));
    }
  }, [pathname]);

  useEffect(() => {
    if (matchResult.length > 0 && !isDetailDataFetched) {
      fetchMatchResultDetailData();
      currentUsersUserIdData(currentUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchResult, isDetailDataFetched, currentUserId]);

  // 試合データ取得
  const fetchCurrentResultData = async (localStorageGameResultId: number) => {
    try {
      const [
        matchResultData,
        battingAverageData,
        pitchingResultData,
        plateAppearanceData,
        currentUserIdData,
        plateAppearancesV2Data,
      ] = await Promise.all([
        getCurrentMatchResult(localStorageGameResultId),
        getCurrentBattingAverage(localStorageGameResultId),
        getCurrentPitchingResult(localStorageGameResultId),
        getCurrentPlateAppearance(localStorageGameResultId),
        getCurrentUserId(),
        getPlateAppearancesByGame(localStorageGameResultId),
      ]);
      setPlateAppearancesV2(plateAppearancesV2Data);
      if (matchResultData && matchResultData.length > 0) {
        setMemo(matchResultData[0].memo);
      }
      setMatchResult(matchResultData);
      setBattingAverage(battingAverageData);
      setPitchingResult(pitchingResultData);
      setPlateAppearance(plateAppearanceData);
      setCurrentUserId(currentUserIdData);
    } catch {}
  };

  // user_id
  const currentUsersUserIdData = async (id: number | null) => {
    try {
      const response = await getCurrentUsersUserId(id);
      setCurrentUsersUserId(response);
    } catch {}
  };

  // 勝敗
  const renderScoreResult = (match: {
    my_team_score: number;
    opponent_team_score: number;
  }) => {
    if (match.my_team_score > match.opponent_team_score) {
      return <p className="text-red-500">◯</p>;
    } else if (match.my_team_score < match.opponent_team_score) {
      return <p className="text-blue-500 text-lg">×</p>;
    } else {
      return <p className="text-lg">ー</p>;
    }
  };

  // 打順
  const getBattingOrderTurn = (battingOrderId: string) => {
    const battingOrderTurn = battingOrder.find(
      (order) => order.id.toString() === battingOrderId,
    )?.turn;
    return battingOrderTurn || "";
  };

  // 打席
  const getBattingResultClassName = (battingResult: string) => {
    // 安打系(右中/左中/線など全方向)は赤、犠打・犠飛は共通の部分一致判定で青にする。
    const resultColor = getBattingResultColor(battingResult);
    if (resultColor === HIT_RESULT_COLOR) {
      return "text-red-500";
    }
    if (resultColor === SACRIFICE_RESULT_COLOR) {
      return "text-blue-400";
    }
    // 四球・死球・打妨は安打でも犠打でもないが青で表示する。
    if (["四球", "死球", "打妨"].some((walk) => battingResult.includes(walk))) {
      return "text-blue-400";
    }
    return "";
  };

  // 投球数
  const getInningPitched = (innings_pitched: number) => {
    const wholePart = Math.floor(innings_pitched);
    const fractionalPart = innings_pitched - wholePart;

    let fractionalString = "";
    if (fractionalPart >= 0.32 && fractionalPart <= 0.34) {
      fractionalString = "1/3";
    } else if (fractionalPart >= 0.65 && fractionalPart <= 0.67) {
      fractionalString = "2/3";
    }

    return `${wholePart}回${fractionalString ? `${fractionalString}` : ""}`;
  };

  const _handleShare = () => {};
  const handleResultComplete = () => {
    localStorage.removeItem("gameResultId");
    router.push("/game-result/lists");
  };

  return (
    <>
      <SummaryResultHeader
        onSummaryResult={handleResultComplete}
        text="試合一覧へ"
      />
      <main className="h-full">
        <div className="pb-32 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-20 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            <h2 className="text-xl font-bold text-center lg:text-2xl">
              試合結果まとめ
            </h2>
            <p className="text-sm text-center mt-6 lg:text-base">
              成績を友達にシェアしよう！
            </p>
            <div className="flex justify-center">
              <ResultShareComponent
                matchResult={matchResult}
                id={localStorageGameResultId}
              />
            </div>
            {/* 試合情報 */}
            <div className="mt-6 py-5 px-6 bg-bg_sub rounded-xl">
              {matchResult ? (
                matchResult.map((match: MatchResultDisplay) => (
                  <div key={match.id}>
                    <div className="flex items-center gap-x-2 flex-wrap">
                      <Chip
                        variant="faded"
                        classNames={{
                          base: "border-small border-zic-500 px-2",
                          content: "text-yellow-500 text-xs",
                        }}
                      >
                        {match.match_type === "regular"
                          ? "公式戦"
                          : match.match_type === "open"
                            ? "オープン戦"
                            : ""}
                      </Chip>
                      <AppearanceTypeBadge
                        appearanceType={match.appearance_type}
                      />
                      <p className="text-sm font-normal">
                        {new Date(match.date_and_time).toLocaleDateString()}
                      </p>
                    </div>
                    {match.season_name && (
                      <p className="text-xs text-zinc-400 mt-2">
                        シーズン: {match.season_name}
                      </p>
                    )}
                    <p className="text-sm mt-3">{match.tournament_name}</p>
                    <span className="mt-3 text-xs text-zinc-400">
                      マイチーム
                    </span>
                    <p className="text-base">{match.my_team_name}</p>
                    <div className="flex gap-x-3 items-center mt-2">
                      <div className="flex gap-x-2 items-baseline">
                        {renderScoreResult(match)}
                        <p className="text-lg font-bold">
                          {match.my_team_score} - {match.opponent_team_score}
                        </p>
                      </div>
                      <div className="flex gap-x-1 items-baseline">
                        <span className="text-base font-normal text-zinc-400">
                          vs.
                        </span>
                        <p className="text-base font-bold">
                          {match.opponent_team_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex mt-1.5 gap-x-3">
                      <p className="text-sm text-zinc-400">
                        {getBattingOrderTurn(match.batting_order)}
                      </p>
                      {isDetailDataFetched && (
                        <p className="text-sm text-zinc-400">
                          {match.defensive_position}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div>試合情報はありません。</div>
              )}
              <Divider className="my-4" />
              {/* 打撃成績 */}
              <div>
                {battingAverage ? (
                  battingAverage.map((batting: BattingAverageDisplay) => (
                    <div key={batting.id}>
                      <p className="text-xs text-zinc-400">打撃</p>
                      <ul className="flex flex-wrap gap-2 mt-2">
                        {(plateAppearancesV2.length > 0
                          ? plateAppearancesV2
                          : (plateAppearance ?? [])
                        ).map((plate, index) => (
                          <li
                            key={`${plate.batter_box_number ?? "na"}-${index}`}
                          >
                            <p
                              className={`font-bold ${getBattingResultClassName(
                                plate.batting_result,
                              )}`}
                            >
                              {plate.batting_result}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1">
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">打点:</p>
                          <span className="block text-base font-bold">
                            {batting.runs_batted_in}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">得点:</p>
                          <span className="block text-base font-bold">
                            {batting.run}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">失策:</p>
                          <span className="block text-base font-bold">
                            {batting.error}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">盗塁:</p>
                          <span className="block text-base font-bold">
                            {batting.stealing_base}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">盗塁死:</p>
                          <span className="block text-base font-bold">
                            {batting.caught_stealing}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <p className="text-sm text-zinc-500">
                      打撃成績はありません。
                    </p>
                  </>
                )}
              </div>
              {plateAppearancesV2.length > 0 && (
                <>
                  <Divider className="my-4" />
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">打席詳細</p>
                    <div className="flex flex-col gap-y-2">
                      {plateAppearancesV2.map((plate) => (
                        <PlateAppearanceSummaryCard
                          key={plate.id}
                          plateAppearance={plate}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              <Divider className="my-4" />
              {/* 投手成績 */}
              <div>
                {pitchingResult ? (
                  pitchingResult.map((pitching) => (
                    <div key={pitching.id}>
                      <p className="text-xs text-zinc-400 mb-2">投手</p>
                      <div className="flex gap-x-4">
                        {pitching.win === 1 ? (
                          <p className="text-red-500 font-bold">勝利投手</p>
                        ) : pitching.loss === 1 ? (
                          <p className="text-blue-500 font-bold">敗戦投手</p>
                        ) : (
                          <></>
                        )}
                        <div className="flex gap-x-4">
                          <span>
                            {getInningPitched(pitching.innings_pitched)}
                          </span>
                          <span>{pitching.number_of_pitches}球</span>
                        </div>
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1">
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">
                            ホールド:
                          </p>
                          <span className="block text-base font-bold">
                            {pitching.hold}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">セーブ:</p>
                          <span className="block text-base font-bold">
                            {pitching.saves}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">失点:</p>
                          <span className="block text-base font-bold">
                            {pitching.run_allowed}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">自責点:</p>
                          <span className="block text-base font-bold">
                            {pitching.earned_run}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">被安打:</p>
                          <span className="block text-base font-bold">
                            {pitching.hits_allowed}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">
                            被本塁打:
                          </p>
                          <span className="block text-base font-bold">
                            {pitching.home_runs_hit}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">奪三振:</p>
                          <span className="block text-base font-bold">
                            {pitching.strikeouts}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">四球:</p>
                          <span className="block text-base font-bold">
                            {pitching.base_on_balls}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-zinc-400 mr-2">死球:</p>
                          <span className="block text-base font-bold">
                            {pitching.hit_by_pitch}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    投手成績はありません。
                  </p>
                )}
              </div>
            </div>
            {memo !== undefined ? (
              <>
                <p className="mt-4 text-sm text-zinc-500">MEMO</p>
                <div className="mt-2 border-1 border-zinc-500 rounded-lg p-3">
                  {memo
                    ?.split("\n")
                    .map((line: string, index: number, array: string[]) => (
                      <p key={index} className="text-sm text-zinc-200">
                        {line}
                        {index < array.length - 1 && <br />}
                      </p>
                    ))}
                </div>
              </>
            ) : (
              <></>
            )}
            <Link
              href={`/mypage/${currentUsersUserId}`}
              className="text-yellow-600 border-b-1 border-yellow-600 text-sm mt-8 ml-auto mr-0 block w-fit"
            >
              マイページへ
            </Link>
            <AdInFeed
              slot={adSlots.gameResultSummaryInFeed}
              layoutKey="-6t+ed+2i-1n-4w"
            />
          </div>
        </div>
      </main>
    </>
  );
}
