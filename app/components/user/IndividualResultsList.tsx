"use client";

import type { SeasonData } from "@app/interface";
import { Skeleton } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ResultsSelectBox from "@app/components/select/ResultsSelectBox";
import BattingAverageTable from "@app/components/table/BattingAverageTable";
import PitchingRecordTable from "@app/components/table/PitchingRecordTable";
import { years } from "@app/data/TestData";
import { usePersonalBattingAverage } from "@app/hooks/batting/getPersonalBattingAverage";
import { usePersonalBattingStatus } from "@app/hooks/batting/getPersonalBattingStatus";
import { usePersonalPitchingResult } from "@app/hooks/pitching/getPersonalPitchingResult";
import { usePersonalPitchingResultStats } from "@app/hooks/pitching/getPersonalPitchingResultStats";
import { getSeasons } from "@app/services/seasonsService";

type UserId = {
  userId: number;
};

export default function IndividualResultsList(props: UserId) {
  const { userId } = props;
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(
    undefined,
  );
  const [seasonsData, setSeasonsData] = useState<SeasonData[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<
    (string | number)[]
  >([]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasonsList = await getSeasons(userId);
        setSeasonsData(seasonsList);
        const seasonNames: (string | number)[] = seasonsList.map(
          (s: SeasonData) => s.name,
        );
        seasonNames.unshift("全て");
        setAvailableSeasons(seasonNames);
      } catch (error) {
        console.error("Failed to fetch seasons:", error);
      }
    };
    fetchSeasons();
  }, [userId]);

  const handleSeasonChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    if (value === "全て") {
      setSelectedSeason(undefined);
    } else {
      const season = seasonsData.find((s) => s.name === value);
      setSelectedSeason(season?.id);
    }
  };

  const { personalBattingAverages, isLoadingBA } =
    usePersonalBattingAverage(userId, selectedSeason);
  const { personalBattingStatus, isLoadingBS } =
    usePersonalBattingStatus(userId, selectedSeason);
  const { personalPitchingResults, isLoadingPR } =
    usePersonalPitchingResult(userId, selectedSeason);
  const { personalPitchingStatus, isLoadingPS } =
    usePersonalPitchingResultStats(userId, selectedSeason);

  const isLoading = isLoadingBA || isLoadingBS || isLoadingPR || isLoadingPS;

  if (isLoading) {
    return (
      <div className="my-6">
        <Skeleton className="rounded-lg">
          <div className="h-80 w-full rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg_sub p-4 rounded-xl lg:p-6">
        <div className="flex gap-x-4 mb-5">
          <ResultsSelectBox
            radius="full"
            className="bg-transparent rounded-full text-xs border-zinc-400 max-w-xs"
            data={years}
            variant="faded"
            color="primary"
            ariaLabel="シーズンを選択"
            labelPlacement="outside"
            size="sm"
            onChange={handleSeasonChange}
            propsYears={availableSeasons}
            selectedKeys={
              selectedSeason
                ? [
                    seasonsData.find((s) => s.id === selectedSeason)?.name ||
                      "",
                  ]
                : ["全て"]
            }
          />
        </div>
        <h2 className="text-xl">打撃成績</h2>
        <BattingAverageTable
          personalBattingAverages={personalBattingAverages}
          personalBattingStatus={personalBattingStatus}
        />
        <h2 className="text-xl mt-8">投手成績</h2>
        <PitchingRecordTable
          personalPitchingResults={personalPitchingResults}
          personalPitchingStatus={personalPitchingStatus}
        />
        <Link
          href="/calculation-of-grades"
          className="text-xs font-normal border-b mt-4 ml-auto mr-0 block w-fit"
        >
          成績の算出方法について
        </Link>
      </div>
    </>
  );
}
