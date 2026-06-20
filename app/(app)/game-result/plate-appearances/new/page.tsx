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

export default function NewPlateAppearancePage() {
  const router = useRouter();
  useRequireAuth();
  const [gameResultId, setGameResultId] = useState<number | null>(null);
  const [batterBoxNumber, setBatterBoxNumber] = useState<number | null>(null);
  const [opponentTeamId, setOpponentTeamId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gameResultId");
    if (!saved) {
      router.push("/game-result/record");
      return;
    }
    const id = JSON.parse(saved) as number;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGameResultId(id);
    getPlateAppearancesByGame(id).then((plateAppearances) => {
      setBatterBoxNumber(plateAppearances.length + 1);
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
      <main className="h-full">
        <div className="pb-40 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
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
