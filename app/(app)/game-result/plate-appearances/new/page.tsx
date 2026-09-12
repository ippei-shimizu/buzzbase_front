"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderResult from "@app/components/header/HeaderResult";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { checkExistingMatchResults } from "@app/services/matchResultsService";
import { getCurrentUserId } from "@app/services/userService";
import { getPlateAppearancesByGame } from "@app/services/v2/plateAppearanceService";
import { PlateAppearanceWizard } from "../_components/PlateAppearanceWizard";

const LIST_PATH = "/game-result/plate-appearances";
const GAME_RESULT_LIST_PATH = "/game-result/lists";

export default function NewPlateAppearancePage() {
  const router = useRouter();
  useRequireAuth();
  const [gameResultId, setGameResultId] = useState<number | null>(null);
  const [batterBoxNumber, setBatterBoxNumber] = useState<number | null>(null);
  const [opponentTeamId, setOpponentTeamId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gameResultId");
    if (!saved) {
      // 記録画面へ戻すと gameResultId 不在を理由に空の試合が自動作成されるため、
      // 記録対象を見失ったときは試合一覧へ逃がす。
      router.push(GAME_RESULT_LIST_PATH);
      return;
    }
    const id = JSON.parse(saved) as number;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGameResultId(id);
    getPlateAppearancesByGame(id).then((plateAppearances) => {
      // 件数ベースだと途中の打席を削除した際に既存番号と衝突するため、
      // 既存の最大 batter_box_number + 1 で採番する。
      const maxBatterBoxNumber = plateAppearances.reduce(
        (max, plateAppearance) =>
          Math.max(max, plateAppearance.batter_box_number),
        0,
      );
      setBatterBoxNumber(maxBatterBoxNumber + 1);
    });
    getCurrentUserId().then((userId) => {
      checkExistingMatchResults(id, userId).then((matchResult) => {
        if (matchResult?.opponent_team_id) {
          setOpponentTeamId(matchResult.opponent_team_id);
        }
      });
    });
  }, [router]);

  return (
    <>
      <HeaderResult />
      <main className="buzz-dark min-h-full">
        <div className="pb-52 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-12 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            {gameResultId !== null && batterBoxNumber !== null ? (
              <PlateAppearanceWizard
                gameResultId={gameResultId}
                batterBoxNumber={batterBoxNumber}
                onCompleted={() => router.push(LIST_PATH)}
                onCancel={() => router.push(LIST_PATH)}
                defaultTeamId={opponentTeamId}
              />
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
