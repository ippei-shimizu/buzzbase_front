"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderResult from "@app/components/header/HeaderResult";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { RECORD_PATTERN_STORAGE_KEY } from "@app/constants/gameRecord";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getPlateAppearancesByGame } from "@app/services/v2/plateAppearanceService";
import { PlateAppearanceWizard } from "./_components/PlateAppearanceWizard";

export default function PlateAppearanceRecordPage() {
  const router = useRouter();
  useRequireAuth();
  const [gameResultId, setGameResultId] = useState<number | null>(null);
  const [batterBoxNumber, setBatterBoxNumber] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gameResultId");
    if (!saved) {
      router.push("/game-result/record");
      return;
    }
    const id = JSON.parse(saved) as number;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGameResultId(id);
    // 既存打席数 +1 を打席番号として採番する。
    getPlateAppearancesByGame(id).then((plateAppearances) => {
      setBatterBoxNumber(plateAppearances.length + 1);
    });
  }, [router]);

  const handleCompleted = () => {
    const raw = localStorage.getItem(RECORD_PATTERN_STORAGE_KEY);
    // 壊れた値が入っていても遷移が止まらないよう既定 both にフォールバックする。
    const pattern = (() => {
      try {
        return raw ? JSON.parse(raw) : "both";
      } catch {
        return "both";
      }
    })();
    router.push(
      pattern === "both" ? "/game-result/pitching/" : "/game-result/summary/",
    );
  };

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
                onCompleted={handleCompleted}
                onCancel={() => router.push("/game-result/record")}
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
