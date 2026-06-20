"use client";
import type {
  AppearanceType,
  InningFormat,
  SeasonData,
  TournamentData,
} from "@app/interface";
import type { RecordPattern } from "@app/interface/gameRecord";
import type { Stadium } from "@app/interface/stadium";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { type SetStateAction, useEffect, useRef, useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderResult from "@app/components/header/HeaderResult";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { APPEARANCE_TYPE_OPTIONS } from "@app/constants/appearanceType";
import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import {
  createGameResult,
  updateGameResult,
} from "@app/services/gameResultsService";
import {
  checkExistingMatchResults,
  createMatchResults,
  getMatchResultFormDefaults,
  updateMatchResult,
} from "@app/services/matchResultsService";
import { getPositions } from "@app/services/positionService";
import { createSeason, getSeasons } from "@app/services/seasonsService";
import { createOrUpdateTeam, getTeams } from "@app/services/teamsService";
import {
  createTournament,
  getTournaments,
  updateTournament,
} from "@app/services/tournamentsService";
import { getCurrentUserId, getUserData } from "@app/services/userService";
import { createStadium, searchStadiums } from "@app/services/v2/stadiumService";
import PatternSelector from "./_components/PatternSelector";
import ScoreStepper from "./_components/ScoreStepper";

// 打順の選択肢。代打・代走・途中出場・未出場のケースで「なし」を選べるよう先頭に追加。
// 「なし」は id=""（空文字）として、state（matchBattingOrder）と Select の selectedKeys を一致させる。
const battingOrder = [
  { id: "", turn: "なし" },
  { id: "1", turn: "1番" },
  { id: "2", turn: "2番" },
  { id: "3", turn: "3番" },
  { id: "4", turn: "4番" },
  { id: "5", turn: "5番" },
  { id: "6", turn: "6番" },
  { id: "7", turn: "7番" },
  { id: "8", turn: "8番" },
  { id: "9", turn: "9番" },
  { id: "10", turn: "-" },
];

type Team = {
  id: string;
  name: string;
};

type Position = {
  userId: string;
  position_id: number;
  id: string;
  name: string;
};

type userData = {
  image: { url: string };
  name: string;
  id: number;
  url: string;
  introduction: string;
  positions: Position[];
  team_id: number;
};

export default function GameRecord() {
  const [userData, setUserData] = useState<userData | null>(null);
  const [existingGameDate, setExistingGameDate] = useState<string>("");
  const [myTeam, setMyTeam] = useState("");
  const [existingMyTeam, setExistingMyTeam] = useState("");
  const [teamsData, setTeamsData] = useState<Team[]>([]);
  const [positionData, setPositionData] = useState<Position[]>([]);
  const [tournamentData, setTournamentData] = useState<TournamentData[]>([]);
  const [myPosition, setMyPosition] = useState("");
  const [matchType, setMatchType] = useState("regular");
  const [opponentTeam, setOpponentTeam] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingOpponentTeam, setExistingOpponentTeam] = useState<
    number | undefined
  >(undefined);
  // 点数は完封 0-0 を許容するため初期値 0。手入力で空にしたときは null（未入力）。
  const [myTeamScore, setMyTeamScore] = useState<number | null>(0);
  const [opponentTeamScore, setOpponentTeamScore] = useState<number | null>(0);
  const [stadiumName, setStadiumName] = useState("");
  const [stadiumId, setStadiumId] = useState<number | null>(null);
  const [stadiumData, setStadiumData] = useState<Stadium[]>([]);
  // 既存試合の編集中かどうか（編集時はパターン選択を出さず単一ボタンにする）。
  const [isEditMode, setIsEditMode] = useState(false);
  const [matchBattingOrder, setMatchBattingOrder] = useState("");
  const [existingMatchBattingOrder, setExistingMatchBattingOrder] =
    useState("");
  const [defensivePosition, setDefensivePosition] = useState<string>("");
  const [existingDefensivePosition, setExistingDefensivePosition] =
    useState<string>("");
  const [tournament, setTournament] = useState<number | null>(null);
  const [inputTournamentName, setInputTournamentName] = useState("");
  const [seasonsData, setSeasonsData] = useState<SeasonData[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [inputSeasonName, setInputSeasonName] = useState("");
  const [matchMemo, setMatchMemo] = useState<string | null>(null);
  // 試合のイニング制（7 or 9）。初期値は新規作成時に直近試合の値、編集時は当該試合の値で上書きされる。
  const [inningFormat, setInningFormat] = useState<InningFormat>(9);
  // 出場区分（先発 / 代打のみ / 代走のみ）。代打のみ・代走のみは打順／守備位置を任意に。
  const [appearanceType, setAppearanceType] =
    useState<AppearanceType>("starter");
  const [isMatchDate, setIsMatchDate] = useState(true);
  const [isMyTeamValid, setIsMyTeamValid] = useState(true);
  const [isOpponentTeamValid, setIsOpponentTeamValid] = useState(true);
  const [isMyTeamScoreValid, setIsMyTeamScoreValid] = useState(true);
  const [isOpponentTeamScoreValid, setIsOpponentTeamScoreValid] =
    useState(true);
  const [isBattingOrderValid, setIsBattingOrderValid] = useState(true);
  const [isDefensivePositionValid, setIsDefensivePositionValid] =
    useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [localStorageGameResultId, setLocalStorageGameResultId] = useState<
    number | null
  >(null);
  const pathname = usePathname();
  const router = useRouter();
  useRequireAuth();
  // 球場サジェスト検索のデバウンスタイマーと、最新リクエスト判定用のシーケンス番号。
  const stadiumSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stadiumRequestId = useRef(0);

  const fetchData = async () => {
    try {
      // 互いに独立した取得なので並列化して初期表示を速くする。
      const [
        currentUserData,
        getTeamsList,
        getTournamentList,
        getSeasonsList,
        positionDataList,
        stadiumsResponse,
      ] = await Promise.all([
        getUserData(),
        getTeams(),
        getTournaments(),
        getSeasons(),
        getPositions(),
        searchStadiums({}),
      ]);
      setUserData(currentUserData);
      setTeamsData(getTeamsList);
      setSeasonsData(getSeasonsList);
      // マイチーム名取得
      const userTeam = getTeamsList.find(
        (team: { id: string }) => team.id === currentUserData.team_id,
      );
      if (userTeam) {
        setMyTeam(userTeam.name);
      }
      setPositionData(positionDataList);
      setTournamentData(getTournamentList);
      setStadiumData(stadiumsResponse.data);
    } catch (error) {
      throw error;
    }
  };

  // 既に同じ game_result_id の試合記録が存在すれば各フィールドへ反映し、
  // 見つかったかどうかを boolean で返す（新規記録時のデフォルト適用判定に使う）。
  const fetchExistingMatchResult = async (
    gameResultId: number,
  ): Promise<boolean> => {
    try {
      const currentUserId = await getCurrentUserId();
      const existingMatchResult = await checkExistingMatchResults(
        gameResultId,
        currentUserId,
      );
      if (existingMatchResult) {
        // stadium_id を復元する。v1 レスポンスは球場名を含まないため、
        // 表示名は候補リストから id で best-effort に引き当てる（見つからなくても
        // stadium_id は保持され、保存時に球場が維持される）。
        if (existingMatchResult.stadium_id) {
          setStadiumId(existingMatchResult.stadium_id);
          const stadiumList = await searchStadiums({ per_page: 100 });
          const foundStadium = stadiumList.data.find(
            (stadium) => stadium.id === existingMatchResult.stadium_id,
          );
          if (foundStadium) setStadiumName(foundStadium.name);
        }
        const date = new Date(existingMatchResult.date_and_time);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        setExistingGameDate(formattedDate);
        setMatchType(existingMatchResult.match_type);
        setTournament(existingMatchResult.tournament_id);
        setExistingMyTeam(existingMatchResult.my_team_id);
        setMyTeamScore(existingMatchResult.my_team_score);
        setOpponentTeamScore(existingMatchResult.opponent_team_score);
        setExistingMatchBattingOrder(existingMatchResult.batting_order);
        setMatchMemo(existingMatchResult.memo);
        setExistingOpponentTeam(existingMatchResult.opponent_team_id);
        setExistingDefensivePosition(existingMatchResult.defensive_position);
        if (existingMatchResult.season_id) {
          setSelectedSeason(existingMatchResult.season_id);
        }
        if (
          existingMatchResult.inning_format === 7 ||
          existingMatchResult.inning_format === 9
        ) {
          setInningFormat(existingMatchResult.inning_format);
        }
        // appearance_type は MatchResultsData で AppearanceType として型付けされているため
        // ランタイムガードは不要。inning_format と同様にそのまま反映する。
        setAppearanceType(existingMatchResult.appearance_type);
      }
      return Boolean(existingMatchResult);
    } catch (error) {
      console.error("Error fetching existing match result:", error);
      return false;
    }
  };

  // 新規記録時のフォーム初期値（直近試合の inning_format / 打順）を適用する。
  const applyFormDefaults = async () => {
    try {
      const defaults = await getMatchResultFormDefaults();
      if (defaults?.inning_format === 7 || defaults?.inning_format === 9) {
        setInningFormat(defaults.inning_format);
      }
      if (defaults?.batting_order) {
        setMatchBattingOrder(defaults.batting_order);
        setExistingMatchBattingOrder(defaults.batting_order);
      }
    } catch (error) {
      console.error("フォーム初期値の取得に失敗しました", error);
    }
  };

  useEffect(() => {
    fetchData();
    // 既存試合の編集として入ったときだけ編集モード。新規記録フロー（保存して
    // 戻った場合を含む）はパターン選択を出すため false のままにする。
    const isEdit =
      localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY) === "true";
    setIsEditMode(isEdit);
    // ローカルストレージからid取得
    const savedGameResultId = localStorage.getItem("gameResultId");
    if (savedGameResultId) {
      setLocalStorageGameResultId(JSON.parse(savedGameResultId));
      // 既存試合がなければ（＝新規記録フロー）直近試合のデフォルトを適用する。
      fetchExistingMatchResult(JSON.parse(savedGameResultId)).then((found) => {
        if (!found && !isEdit) applyFormDefaults();
      });
    } else if (pathname === "/game-result/record") {
      // gameResultId がない＝新規記録なので、編集フラグは確実に解除しておく。
      localStorage.removeItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY);
      setIsEditMode(false);
      // gameResultId がない場合は自動作成
      const createNew = async () => {
        try {
          const newGameResult = await createGameResult();
          localStorage.setItem(
            "gameResultId",
            JSON.stringify(newGameResult.id),
          );
          setLocalStorageGameResultId(newGameResult.id);
        } catch (error) {
          console.error("GameResultの自動作成に失敗しました", error);
        }
      };
      createNew();
      applyFormDefaults();
    }
    if (
      !(pathname === "/game-result/battings") &&
      !(pathname === "/game-result/record") &&
      savedGameResultId
    ) {
      localStorage.removeItem("gameResultId");
    }
  }, [pathname]);

  useEffect(() => {
    // 守備位置設定
    if (userData && positionData.length > 0) {
      const userPositionFirstId = userData.positions[0]?.id;
      const userPosition = positionData.find(
        (position) => position.id === userPositionFirstId,
      );
      if (userPosition) {
        setMyPosition(userPosition.id.toString());
      }
    }
  }, [userData, positionData]);

  // チーム名検索(編集時)
  useEffect(() => {
    if (existingMyTeam) {
      const foundTeam = teamsData.find((team) => team.id === existingMyTeam);
      if (foundTeam) {
        setMyTeam(foundTeam.name);
      }
    }
  }, [existingMyTeam, teamsData]);

  // 今日の日付
  const [gameDate, setGameDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  // 日付入力
  const handleDateChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setExistingGameDate(event.target.value);
    setGameDate(event.target.value);
  };

  // 試合タイプ
  const handleMatchTypeChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setMatchType(event.target.value);
  };

  // 自チーム名設定
  const handleMyTeamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExistingMyTeam(event.target.value);
    setMyTeam(event.target.value);
  };

  // 相手チーム設定
  const handleOpponentTeamChange = (teamName: React.Key | null) => {
    setExistingOpponentTeam(Number(teamName));
    setOpponentTeam(teamName as string);
  };

  const handleTournamentInputChange = (value: string) => {
    setInputTournamentName(value);
  };
  const handleTournamentSelectionChange = (value: React.Key | null) => {
    setTournament(value as number | null);
  };

  const handleSeasonInputChange = (value: string) => {
    setInputSeasonName(value);
  };
  const handleSeasonSelectionChange = (value: React.Key | null) => {
    setSelectedSeason(value as number | null);
  };

  // 球場の入力。入力名が候補と完全一致すれば id を確定、そうでなければ未確定(null)に
  // 戻す。あわせてサーバー検索で候補を更新する。
  const handleStadiumInputChange = (value: string) => {
    setStadiumName(value);
    const matched = stadiumData.find((stadium) => stadium.name === value);
    setStadiumId(matched ? matched.id : null);
    // デバウンス + 最新リクエスト勝ちで、高速入力時の過剰リクエストとレースを防ぐ。
    if (stadiumSearchTimer.current) clearTimeout(stadiumSearchTimer.current);
    stadiumSearchTimer.current = setTimeout(() => {
      const requestId = stadiumRequestId.current + 1;
      stadiumRequestId.current = requestId;
      searchStadiums(value ? { q: value } : {}).then((response) => {
        if (requestId === stadiumRequestId.current) {
          setStadiumData(response.data);
        }
      });
    }, 250);
  };
  const handleStadiumSelectionChange = (key: React.Key | null) => {
    if (key == null) return;
    const found = stadiumData.find(
      (stadium) => String(stadium.id) === String(key),
    );
    if (found) {
      setStadiumId(found.id);
      setStadiumName(found.name);
    }
  };

  // 打順。「なし」は id=""（空文字）なのでそのまま state に保存する。
  const handleBattingOrderChange = (event: { target: { value: string } }) => {
    const order = event.target.value;
    setExistingMatchBattingOrder(order);
    setMatchBattingOrder(order);
  };

  // 守備位置
  const handleDefensivePositionChange = (event: {
    target: { value: string };
  }) => {
    const position = event.target.value;
    setExistingDefensivePosition(position);
    setDefensivePosition(position);
  };

  const setErrorsWithTimeout = (newErrors: React.SetStateAction<string[]>) => {
    setErrors(newErrors);
    setTimeout(() => {
      setErrors([]);
    }, 2000);
  };
  // バリデーション
  const validateForm = () => {
    let isValid = true;
    const newErrors = [];

    if (!localStorageGameResultId) {
      isValid = false;
      newErrors.push("エラーが発生しました。");
    }

    if (!gameDate) {
      setIsMatchDate(false);
      isValid = false;
      newErrors.push("試合日付が未入力です。");
    } else {
      setIsMatchDate(true);
    }

    if (!myTeam) {
      setIsMyTeamValid(false);
      isValid = false;
      newErrors.push("自チーム名が未入力です。");
    } else {
      setIsMyTeamValid(true);
    }

    if (!opponentTeam) {
      setIsOpponentTeamValid(false);
      isValid = false;
      newErrors.push("相手チーム名が未入力です。");
    } else {
      setIsOpponentTeamValid(true);
    }

    if (!myTeamScore && myTeamScore !== 0) {
      setIsMyTeamScoreValid(false);
      isValid = false;
      newErrors.push("自チーム名の点数が未入力です。");
    } else {
      setIsMyTeamScoreValid(true);
    }

    if (!opponentTeamScore && opponentTeamScore !== 0) {
      setIsOpponentTeamScoreValid(false);
      isValid = false;
      newErrors.push("相手チーム名の点数が未入力です。");
    } else {
      setIsOpponentTeamScoreValid(true);
    }

    // 先発／途中出場の場合のみ打順／守備位置を必須とする。
    // 代打／代走／未出場は入力任意（出場区分切替時に自動で空文字がセットされる）。
    const lineupRequired =
      appearanceType === "starter" || appearanceType === "substitute";

    if (lineupRequired && !matchBattingOrder && !existingMatchBattingOrder) {
      setIsBattingOrderValid(false);
      isValid = false;
      newErrors.push("打順が未入力です。");
    } else {
      setIsBattingOrderValid(true);
    }

    if (
      lineupRequired &&
      !defensivePosition &&
      !myPosition &&
      !existingDefensivePosition
    ) {
      setIsDefensivePositionValid(false);
      isValid = false;
      newErrors.push("守備位置が未入力です。");
    } else {
      setIsDefensivePositionValid(true);
    }

    if (!isValid) {
      setErrorsWithTimeout(newErrors);
    }

    return isValid;
  };

  // フォームデータ送信。pattern は新規記録時のパターン選択で渡される
  // （編集 / 未出場の単一ボタン経由では undefined）。
  const handleSubmit = async (pattern?: RecordPattern) => {
    if (!validateForm() || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setErrors([]);
    try {
      const userId = userData?.id;

      // 球場の解決: 入力名があり id 未確定なら新規作成して id を確定させる。
      // 作成に失敗しても保存はブロックせず、球場なし（null）で続行する。
      let resolvedStadiumId = stadiumId;
      const trimmedStadiumName = stadiumName.trim();
      if (trimmedStadiumName && !resolvedStadiumId) {
        const createdStadium = await createStadium({
          name: trimmedStadiumName,
        });
        if (createdStadium.ok) {
          resolvedStadiumId = createdStadium.data.id;
        } else {
          setErrorsWithTimeout([
            "球場の登録に失敗しました。球場なしで保存します。",
          ]);
        }
      }
      let myTeamId = teamsData.find((team) => team.name === myTeam)?.id;
      if (!myTeamId) {
        const newTeam = await createOrUpdateTeam({
          team: {
            name: myTeam,
            category_id: undefined,
            prefecture_id: undefined,
          },
        });
        myTeamId = newTeam.data.id;
      }

      // 大会保存
      let tournamentId = tournament;
      const existingTournament = tournamentData.find(
        (t) => t.name === inputTournamentName,
      );
      if (existingTournament) {
        const updatedTournament = await updateTournament(
          existingTournament.id,
          inputTournamentName,
        );
        if (updatedTournament) {
          tournamentId = updatedTournament.id;
        }
      } else if (inputTournamentName) {
        const newTournament = await createTournament({
          name: inputTournamentName,
        });
        if (newTournament) {
          setTournamentData([...tournamentData, newTournament]);
          tournamentId = newTournament.id;
        }
      }

      // シーズン保存
      let seasonId = selectedSeason;
      if (inputSeasonName && !selectedSeason) {
        const existingSeason = seasonsData.find(
          (s) => s.name === inputSeasonName,
        );
        if (existingSeason) {
          seasonId = existingSeason.id;
        } else {
          const newSeason = await createSeason(inputSeasonName);
          if (newSeason) {
            setSeasonsData([...seasonsData, newSeason]);
            seasonId = newSeason.id;
          }
        }
      }

      // 相手チーム保存
      let opponentTeamId;
      if (typeof opponentTeam === "string") {
        const newTeamResponse = await createOrUpdateTeam({
          team: {
            name: opponentTeam,
            category_id: undefined,
            prefecture_id: undefined,
          },
        });
        opponentTeamId = newTeamResponse.data.id;
      } else {
        opponentTeamId = teamsData.find(
          (team) => team.name === opponentTeam,
        )?.id;
      }
      const matchResultData = {
        match_result: {
          game_result_id: localStorageGameResultId,
          user_id: Number(userId),
          date_and_time: existingGameDate ? existingGameDate : gameDate,
          match_type: matchType,
          my_team_id: Number(existingMyTeam)
            ? Number(existingMyTeam)
            : Number(myTeamId),
          opponent_team_id: existingOpponentTeam
            ? existingOpponentTeam
            : Number(opponentTeamId),
          my_team_score: myTeamScore,
          opponent_team_score: opponentTeamScore,
          batting_order: existingMatchBattingOrder
            ? existingMatchBattingOrder
            : matchBattingOrder,
          defensive_position: existingDefensivePosition
            ? existingDefensivePosition
            : myPosition,
          tournament_id: tournamentId,
          stadium_id: resolvedStadiumId,
          memo: matchMemo,
          inning_format: inningFormat,
          appearance_type: appearanceType,
        },
      };
      const existingMatchResults = await checkExistingMatchResults(
        matchResultData.match_result.game_result_id,
        matchResultData.match_result.user_id,
      );
      if (existingMatchResults) {
        await updateMatchResult(existingMatchResults.id, matchResultData);
        // season_idをgame_resultに保存
        if (localStorageGameResultId !== null) {
          await updateGameResult(localStorageGameResultId, {
            game_result: { season_id: seasonId },
          });
        }
      } else {
        const response = await createMatchResults(matchResultData);
        if (
          typeof userId !== "undefined" &&
          localStorageGameResultId !== null
        ) {
          const updateGameResultData = {
            game_result: {
              user_id: userId,
              match_result_id: response.id,
              batting_average_id: null,
              pitching_result_id: null,
              season_id: seasonId,
            },
          };
          await updateGameResult(
            localStorageGameResultId,
            updateGameResultData,
          );
        }
      }
      // 記録パターンを次画面へ引き継ぐ（編集 / 未出場の単一ボタンは both 相当）。
      const effectivePattern: RecordPattern = pattern ?? "both";
      localStorage.setItem(
        RECORD_PATTERN_STORAGE_KEY,
        JSON.stringify(effectivePattern),
      );
      // 未出場はまとめへ、投手のみは投手入力へ、それ以外は打撃入力へ。
      const nextPath =
        appearanceType === "no_play"
          ? `/game-result/summary/`
          : effectivePattern === "pitching"
            ? `/game-result/pitching/`
            : `/game-result/batting/`;
      router.push(nextPath);
    } catch (error) {
      console.error("試合結果の保存に失敗しました", error);
      setErrorsWithTimeout([
        "保存に失敗しました。時間をおいて再度お試しください。",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HeaderResult />
      {isSubmitting && <LoadingSpinner />}
      <main className="h-full">
        <div className="pb-40 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <ErrorMessages errors={errors} />
          <div className="pt-12 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            <div className="flex items-center justify-center gap-x-2">
              <p className="text-xl font-medium text-yellow-500 lg:text-2xl">
                試合結果
              </p>
              <span className="opacity-40 lg:text-lg">→</span>
              <p className="text-xl font-medium opacity-40 lg:text-2xl">
                打撃結果
              </p>
              <span className="opacity-40 lg:text-lg">→</span>
              <p className="text-xl font-medium opacity-40 lg:text-2xl">
                投手結果
              </p>
            </div>
            <h2 className="text-base text-center mt-5 lg:text-lg">
              試合結果を入力しよう！
            </h2>
            <form>
              <div className="mt-6 py-5 px-6 bg-bg_sub rounded-xl">
                <Input
                  isRequired
                  type="date"
                  size="md"
                  variant="bordered"
                  label="試合日付"
                  labelPlacement="outside-left"
                  className="flex justify-between items-center [&>div>div>div>input]:py-2"
                  color={isMatchDate ? "default" : "danger"}
                  value={existingGameDate ? existingGameDate : gameDate}
                  onChange={handleDateChange}
                />
                <Divider className="my-4" />
                <RadioGroup
                  isRequired
                  label="試合種類"
                  orientation="horizontal"
                  defaultValue={matchType}
                  value={matchType}
                  color="primary"
                  size="sm"
                  className="text-sm flex justify-between items-center flex-row [&>span]:text-white"
                  onChange={handleMatchTypeChange}
                >
                  <Radio value="regular">公式戦</Radio>
                  <Radio value="open">オープン戦</Radio>
                </RadioGroup>
                <Divider className="my-4" />
                <RadioGroup
                  isRequired
                  label="イニング制"
                  orientation="horizontal"
                  value={String(inningFormat)}
                  color="primary"
                  size="sm"
                  className="text-sm flex justify-between items-center flex-row [&>span]:text-white"
                  onValueChange={(value) => {
                    const next = Number(value);
                    if (next === 7 || next === 9) setInningFormat(next);
                  }}
                >
                  <Radio value="9">9回制</Radio>
                  <Radio value="7">7回制</Radio>
                </RadioGroup>
                <Divider className="my-4" />
                {/* 出場区分は選択肢が5つあるためラジオ側は折り返しを許可し、
                    ラベル＋必須マーク部分は shrink-0 で縮まないようにする。 */}
                <RadioGroup
                  isRequired
                  label="出場区分"
                  orientation="horizontal"
                  value={appearanceType}
                  color="primary"
                  size="sm"
                  className="text-sm flex justify-between items-center flex-row [&>span]:text-white"
                  classNames={{
                    label: "shrink-0 whitespace-nowrap",
                    wrapper: "flex-wrap",
                  }}
                  onValueChange={(value) => {
                    // RadioGroup の選択肢は APPEARANCE_TYPE_OPTIONS から生成しているため、
                    // value は必ず AppearanceType に絞られる。
                    const next = value as AppearanceType;
                    setAppearanceType(next);
                    // 代打／代走／未出場 を選んだ瞬間に打順／守備位置を「なし」（空文字）に
                    // 自動セットする。先発／途中出場のときは現状の値を維持。
                    if (next !== "starter" && next !== "substitute") {
                      setMatchBattingOrder("");
                      setExistingMatchBattingOrder("");
                      setDefensivePosition("");
                      setExistingDefensivePosition("");
                      setMyPosition("");
                    }
                  }}
                >
                  {APPEARANCE_TYPE_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </RadioGroup>
                <Divider className="my-4" />
                <Autocomplete
                  allowsCustomValue
                  label="球場"
                  variant="bordered"
                  placeholder="球場名を入力"
                  labelPlacement="outside-left"
                  className="[&>div]:justify-between [&>div&>label]:whitespace-nowrap"
                  size="md"
                  inputValue={stadiumName}
                  onInputChange={handleStadiumInputChange}
                  onSelectionChange={handleStadiumSelectionChange}
                  selectedKey={stadiumId ? stadiumId.toString() : null}
                >
                  {stadiumData.map((stadium) => (
                    <AutocompleteItem key={stadium.id} textValue={stadium.name}>
                      {stadium.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <Divider className="my-4" />
                <Autocomplete
                  allowsCustomValue
                  label="大会名"
                  variant="bordered"
                  placeholder="大会名を入力"
                  labelPlacement="outside-left"
                  className="[&>div]:justify-between [&>div&>label]:whitespace-nowrap"
                  size="md"
                  onInputChange={handleTournamentInputChange}
                  onSelectionChange={handleTournamentSelectionChange}
                  selectedKey={
                    tournament !== null ? tournament.toString() : null
                  }
                >
                  {tournamentData.map((data) => (
                    <AutocompleteItem key={data.id}>
                      {data.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <Divider className="my-4" />
                <Autocomplete
                  allowsCustomValue
                  label="シーズン"
                  variant="bordered"
                  placeholder="シーズン名を入力"
                  labelPlacement="outside-left"
                  className="[&>div]:justify-between [&>div&>label]:whitespace-nowrap"
                  size="md"
                  onInputChange={handleSeasonInputChange}
                  onSelectionChange={handleSeasonSelectionChange}
                  selectedKey={
                    selectedSeason !== null ? selectedSeason.toString() : null
                  }
                >
                  {seasonsData.map((data) => (
                    <AutocompleteItem key={data.id}>
                      {data.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <Divider className="my-4" />
                <Input
                  isRequired
                  type="text"
                  size="sm"
                  variant="bordered"
                  label="自チーム"
                  labelPlacement="outside-left"
                  placeholder="自分のチーム名を入力"
                  className="flex justify-between items-center [&>div>div>div>input]:py-2"
                  color={isMyTeamValid ? "default" : "danger"}
                  value={myTeam}
                  onChange={handleMyTeamChange}
                />
                <Divider className="my-4" />
                <Autocomplete
                  isRequired
                  allowsCustomValue
                  label="相手チーム"
                  variant="bordered"
                  placeholder="相手のチーム名を入力"
                  labelPlacement="outside-left"
                  className="[&>div]:justify-between"
                  size="sm"
                  color={isOpponentTeamValid ? "default" : "danger"}
                  selectedKey={
                    existingOpponentTeam
                      ? existingOpponentTeam.toString()
                      : null
                  }
                  onInputChange={(value) => setOpponentTeam(value)}
                  onSelectionChange={handleOpponentTeamChange}
                >
                  {teamsData.map((data) => (
                    <AutocompleteItem key={data.id} textValue={data.name}>
                      {data.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <Divider className="my-4" />
                <div className="flex justify-between items-center">
                  <p
                    className={`text-sm ${
                      isMyTeamScoreValid && isOpponentTeamScoreValid
                        ? "text-white"
                        : "text-red-500"
                    }`}
                  >
                    点数<span className="text-red-500 pl-1">*</span>
                  </p>
                  <div className="flex gap-x-2 items-center">
                    <ScoreStepper
                      value={myTeamScore}
                      onChange={setMyTeamScore}
                      ariaLabel="自チームの点数"
                      placeholder="自分"
                      isValid={isMyTeamScoreValid}
                    />
                    <span>対</span>
                    <ScoreStepper
                      value={opponentTeamScore}
                      onChange={setOpponentTeamScore}
                      ariaLabel="相手チームの点数"
                      placeholder="相手"
                      isValid={isOpponentTeamScoreValid}
                    />
                  </div>
                </div>
                <Divider className="my-4" />
                <Select
                  isRequired={
                    appearanceType === "starter" ||
                    appearanceType === "substitute"
                  }
                  variant="faded"
                  label="打順"
                  labelPlacement="outside-left"
                  size="md"
                  fullWidth={false}
                  color={isBattingOrderValid ? "default" : "danger"}
                  className="grid justify-between items-center grid-cols-[auto_96px]"
                  onChange={handleBattingOrderChange}
                  selectedKeys={
                    existingMatchBattingOrder !== undefined
                      ? [existingMatchBattingOrder.toString()]
                      : []
                  }
                >
                  {battingOrder.map((order) => (
                    <SelectItem key={order.id} textValue={order.turn}>
                      {order.turn}
                    </SelectItem>
                  ))}
                </Select>
                <Divider className="my-4" />
                <Select
                  isRequired={
                    appearanceType === "starter" ||
                    appearanceType === "substitute"
                  }
                  variant="faded"
                  label="守備位置"
                  labelPlacement="outside-left"
                  size="md"
                  fullWidth={false}
                  color={isDefensivePositionValid ? "default" : "danger"}
                  placeholder="守備"
                  onChange={handleDefensivePositionChange}
                  className="grid justify-between items-center grid-cols-[auto_110px]"
                  selectedKeys={
                    existingDefensivePosition
                      ? [existingDefensivePosition]
                      : myPosition
                  }
                >
                  {[
                    <SelectItem key="" textValue="なし" className="text-white">
                      なし
                    </SelectItem>,
                    ...positionData.map((position) => (
                      <SelectItem
                        key={position.id}
                        textValue={position.name}
                        className="text-white"
                      >
                        {position.name}
                      </SelectItem>
                    )),
                  ]}
                </Select>
                <Divider className="my-4" />
                <Textarea
                  variant="bordered"
                  label="メモ"
                  labelPlacement="outside"
                  placeholder="試合の中で気づいたこと、感じたことをメモしておこう！"
                  className="col-span-12 md:col-span-6 mb-6 md:mb-0"
                  onChange={(event) => setMatchMemo(event.target.value)}
                  value={matchMemo !== null ? matchMemo : ""}
                />
              </div>
              <div className="mt-8">
                {appearanceType === "no_play" || isEditMode ? (
                  <Button
                    color="primary"
                    size="md"
                    type="button"
                    radius="sm"
                    className="ml-auto mr-0 px-6 font-bold text-base flex items-center"
                    onPress={() => handleSubmit()}
                    endContent={<NextArrowIcon stroke="#F4F4F4" />}
                    isDisabled={isSubmitting}
                  >
                    {appearanceType === "no_play"
                      ? "試合結果まとめ"
                      : "打撃結果"}
                  </Button>
                ) : (
                  <PatternSelector
                    onSelect={(pattern) => handleSubmit(pattern)}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
