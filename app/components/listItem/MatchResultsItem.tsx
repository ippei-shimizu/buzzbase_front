"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@heroui/react";
import { useRouter } from "next/navigation";

type GameResultItem = {
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
  plate_appearances?: PlateAppearance[];
  pitching_result?: {
    innings_pitched: number;
    run_allowed: number;
    win: number;
    loss: number;
  };
};

type PlateAppearance = {
  id: number;
  batting_result: string;
  game_result_id: number;
  batter_box_number?: number;
};

type MatchResultsItemProps = {
  gameResult: GameResultItem[];
};

export default function MatchResultsItem(props: MatchResultsItemProps) {
  const { gameResult } = props;
  const router = useRouter();

  const renderScoreResult = (match: {
    my_team_score: number;
    opponent_team_score: number;
  }) => {
    if (match?.my_team_score > match?.opponent_team_score) {
      return <p className="text-red-500">◯</p>;
    } else if (match?.my_team_score < match?.opponent_team_score) {
      return <p className="text-blue-500 text-lg">×</p>;
    } else {
      return <p className="text-lg">ー</p>;
    }
  };

  const getBattingResultClassName = (battingResult: string) => {
    const hits = [
      "投安",
      "捕安",
      "一安",
      "二安",
      "三安",
      "遊安",
      "左安",
      "中安",
      "右安",
      "投二",
      "捕二",
      "一二",
      "二二",
      "三二",
      "遊二",
      "左二",
      "中二",
      "右二",
      "投三",
      "捕三",
      "一三",
      "二三",
      "三三",
      "遊三",
      "左三",
      "中三",
      "右三",
      "投本",
      "捕本",
      "一本",
      "二本",
      "三本",
      "遊本",
      "左本",
      "中本",
      "右本",
    ];
    const walks = [
      "四球",
      "死球",
      "投犠打",
      "捕犠打",
      "一犠打",
      "二犠打",
      "三犠打",
      "遊犠打",
      "投犠飛",
      "捕犠飛",
      "一犠飛",
      "二犠飛",
      "三犠飛",
      "遊犠飛",
      "左犠飛",
      "中犠飛",
      "右犠飛",
      "打妨",
    ];

    if (hits.includes(battingResult)) {
      return "text-red-500";
    } else if (walks.includes(battingResult)) {
      return "text-blue-400";
    } else {
      return "font-light";
    }
  };

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

  const handleGameResultEdit = (gameResultId: number) => {
    localStorage.setItem("gameResultId", JSON.stringify(gameResultId));
    router.push(`/game-result/summary/${gameResultId}`);
  };
  return (
    <>
      {gameResult.map((game, _index) => (
        <div key={game.game_result_id}>
          <Card className="px-4 py-3 relative">
            <Button
              color="primary"
              variant="ghost"
              radius="full"
              size="sm"
              className="w-fit absolute right-4 top-3 z-20"
              onPress={() => handleGameResultEdit(game.game_result_id)}
            >
              詳細
            </Button>
            <CardHeader className="p-0 flex-col items-start">
              <div className="flex items-center gap-x-2">
                {game.match_result?.match_type ? (
                  <>
                    <Chip
                      variant="faded"
                      classNames={{
                        base: "border-small border-zic-500 px-2",
                        content: "text-yellow-500 text-xs",
                      }}
                    >
                      {game.match_result.match_type === "regular"
                        ? "公式戦"
                        : game.match_result.match_type === "open"
                          ? "オープン戦"
                          : ""}
                    </Chip>
                    <p className="text-sm font-normal text-zinc-400">
                      {new Date(
                        game.match_result.date_and_time,
                      ).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  ""
                )}
              </div>
              <p className="text-sm mt-2 text-zinc-400">
                {game.match_result?.tournament_name || ""}
              </p>
              <div className="flex gap-x-3 items-center mt-1">
                <div className="flex gap-x-2 items-baseline">
                  {game.match_result && renderScoreResult(game.match_result)}
                  <div className="flex gap-x-2 items-baseline">
                    <p className="text-lg font-bold">
                      {game.match_result?.my_team_score} -{" "}
                      {game.match_result?.opponent_team_score}
                    </p>
                  </div>
                </div>
                <div className="flex gap-x-1 items-baseline">
                  <span className="text-base font-normal text-zinc-400">
                    vs.
                  </span>
                  <p className="text-base font-bold">
                    {game.match_result?.opponent_team_name || ""}
                  </p>
                </div>
              </div>
            </CardHeader>
            <Divider className="my-3" />
            <CardBody className="p-0 table-column-group gap-y-1">
              <div>
                {(game.plate_appearances ?? []).length > 0 && (
                  <p className="text-sm font-normal text-zinc-400">打撃</p>
                )}
                <ul className="flex flex-wrap gap-2 ">
                  {(game.plate_appearances ?? []).length > 0 ? (
                    [...(game.plate_appearances ?? [])]
                      .sort(
                        (
                          a: { batter_box_number?: number },
                          b: { batter_box_number?: number },
                        ) =>
                          (a.batter_box_number ?? 0) -
                          (b.batter_box_number ?? 0),
                      )
                      .map((plate: PlateAppearance) => (
                        <li
                          key={plate.id}
                          className={`font-bold ${getBattingResultClassName(
                            plate.batting_result,
                          )}`}
                        >
                          {plate.batting_result}
                        </li>
                      ))
                  ) : (
                    <></>
                  )}
                </ul>
              </div>
              <div>
                {game.pitching_result &&
                  game.pitching_result.innings_pitched > 0 && (
                    <p className="text-sm font-normal text-zinc-400">投手</p>
                  )}
                {game.pitching_result &&
                game.pitching_result.innings_pitched > 0 ? (
                  <>
                    <ul className="flex flex-wrap gap-2 ">
                      {game.pitching_result &&
                      game.pitching_result.innings_pitched != null ? (
                        <>
                          <li className="font-light">
                            {getInningPitched(
                              game.pitching_result.innings_pitched,
                            )}
                          </li>
                          <li className="font-light">
                            {game.pitching_result.run_allowed}失点
                          </li>
                        </>
                      ) : (
                        <></>
                      )}
                      {game.pitching_result ? (
                        <>
                          {game.pitching_result.win === 1 ? (
                            <li className="text-red-500 font-bold">勝利投手</li>
                          ) : game.pitching_result.loss === 1 ? (
                            <li className="text-blue-400 font-bold">
                              敗戦投手
                            </li>
                          ) : (
                            ""
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </ul>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      ))}
    </>
  );
}
