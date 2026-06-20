"use client";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderResult from "@app/components/header/HeaderResult";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { RECORD_PATTERN_STORAGE_KEY } from "@app/constants/gameRecord";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import {
  deletePlateAppearanceV2,
  getPlateAppearancesByGame,
} from "@app/services/v2/plateAppearanceService";
import { AddPlateAppearanceCard } from "./_components/AddPlateAppearanceCard";
import { PlateAppearanceCard } from "./_components/PlateAppearanceCard";

export default function PlateAppearanceListPage() {
  const router = useRouter();
  useRequireAuth();
  const [gameResultId, setGameResultId] = useState<number | null>(null);
  const [plateAppearances, setPlateAppearances] = useState<PlateAppearanceV2[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const reload = async (id: number) => {
    const list = await getPlateAppearancesByGame(id);
    setPlateAppearances(list);
    setIsLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("gameResultId");
    if (!saved) {
      router.push("/game-result/record");
      return;
    }
    const id = JSON.parse(saved) as number;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGameResultId(id);
    reload(id);
  }, [router]);

  const handleDelete = async (id: number) => {
    const result = await deletePlateAppearanceV2(id);
    if (result.ok && gameResultId !== null) reload(gameResultId);
  };

  const handleComplete = () => {
    const raw = localStorage.getItem(RECORD_PATTERN_STORAGE_KEY);
    const pattern = raw ? JSON.parse(raw) : "both";
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
                    onDelete={() => handleDelete(plateAppearance.id)}
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
                  batterBoxNumber={plateAppearances.length + 1}
                  onAdd={() =>
                    router.push("/game-result/plate-appearances/new")
                  }
                />
                <Button
                  color="primary"
                  radius="sm"
                  className="mt-6 font-bold"
                  onPress={handleComplete}
                  endContent={<NextArrowIcon stroke="#F4F4F4" />}
                  isDisabled={plateAppearances.length === 0}
                >
                  入力を完了する
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
