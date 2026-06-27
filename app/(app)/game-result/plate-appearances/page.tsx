"use client";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderResult from "@app/components/header/HeaderResult";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getCurrentPitchingResult } from "@app/services/pitchingResultsService";
import { getPlateAppearancesByGame } from "@app/services/v2/plateAppearanceService";
import { AddPlateAppearanceCard } from "./_components/AddPlateAppearanceCard";
import { PlateAppearanceCard } from "./_components/PlateAppearanceCard";

const PITCHING_PATH = "/game-result/pitching/";
const SUMMARY_PATH = "/game-result/summary/";

const readRecordPattern = (): string => {
  const raw = localStorage.getItem(RECORD_PATTERN_STORAGE_KEY);
  // 壊れた値が入っていても遷移が止まらないよう既定 both にフォールバックする。
  try {
    return raw ? JSON.parse(raw) : "both";
  } catch {
    return "both";
  }
};

export default function PlateAppearanceListPage() {
  const router = useRouter();
  useRequireAuth();
  const [plateAppearances, setPlateAppearances] = useState<PlateAppearanceV2[]>(
    [],
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasPitching, setHasPitching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("gameResultId");
    if (!saved) {
      router.push("/game-result/record");
      return;
    }
    const id = JSON.parse(saved) as number;
    const editMode =
      localStorage.getItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY) === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEditMode(editMode);

    void (async () => {
      const list = await getPlateAppearancesByGame(id);
      setPlateAppearances(list);
      if (editMode) {
        const pitching = await getCurrentPitchingResult(id);
        setHasPitching(Array.isArray(pitching) && pitching.length > 0);
      }
      setIsLoading(false);
    })();
  }, [router]);

  // 件数ベースだと途中の打席を削除した際に既存番号と衝突するため、
  // 既存の最大 batter_box_number + 1 を次の採番に使う。
  const nextBatterBoxNumber =
    plateAppearances.reduce(
      (max, plateAppearance) =>
        Math.max(max, plateAppearance.batter_box_number),
      0,
    ) + 1;

  // 新規記録時は「両方」パターンのときだけ投手成績入力へ進む。
  const goNewComplete = () => {
    router.push(readRecordPattern() === "both" ? PITCHING_PATH : SUMMARY_PATH);
  };

  return (
    <>
      <HeaderResult />
      <main className="buzz-dark min-h-full">
        <div className="pb-52 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-12 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            <h2 className="text-base text-center mb-6">
              打席結果を記録しよう！
            </h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex flex-col gap-y-3">
                {plateAppearances.map((plateAppearance) => (
                  <PlateAppearanceCard
                    key={plateAppearance.id}
                    plateAppearance={plateAppearance}
                    onEdit={() =>
                      router.push(
                        `/game-result/plate-appearances/${plateAppearance.id}/edit`,
                      )
                    }
                  />
                ))}
                {plateAppearances.length === 0 ? (
                  <p className="text-center text-sm text-zinc-400">
                    「結果を入力」ボタンをタップして
                    <br />
                    最初の打席を記録しよう
                  </p>
                ) : null}
                <AddPlateAppearanceCard
                  batterBoxNumber={nextBatterBoxNumber}
                  onAdd={() =>
                    router.push("/game-result/plate-appearances/new")
                  }
                />

                {isEditMode ? (
                  <div className="mt-6 flex flex-col gap-y-3">
                    {/* 編集時は投手成績の有無に関わらず投手記録へ進める。 */}
                    <Button
                      color="primary"
                      radius="sm"
                      className="font-bold"
                      onPress={() => router.push(PITCHING_PATH)}
                      endContent={<NextArrowIcon stroke="#F4F4F4" />}
                    >
                      {hasPitching ? "投手成績編集へ" : "投手成績を追加"}
                    </Button>
                    <Button
                      variant="bordered"
                      radius="sm"
                      className="font-bold border-2 border-[#d08000] bg-transparent text-[#d08000]"
                      onPress={() => router.push(SUMMARY_PATH)}
                    >
                      試合結果まとめへ
                    </Button>
                  </div>
                ) : (
                  <Button
                    color="primary"
                    radius="sm"
                    className="mt-6 font-bold"
                    onPress={goNewComplete}
                    endContent={<NextArrowIcon stroke="#F4F4F4" />}
                    isDisabled={plateAppearances.length === 0}
                  >
                    入力を完了する
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
