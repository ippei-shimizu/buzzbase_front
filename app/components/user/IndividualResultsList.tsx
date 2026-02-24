"use client";

import { Skeleton } from "@heroui/react";
import Link from "next/link";
import BattingAverageTable from "@app/components/table/BattingAverageTable";
import PitchingRecordTable from "@app/components/table/PitchingRecordTable";
import { usePersonalBattingAverage } from "@app/hooks/batting/getPersonalBattingAverage";
import { usePersonalBattingStatus } from "@app/hooks/batting/getPersonalBattingStatus";
import { usePersonalPitchingResult } from "@app/hooks/pitching/getPersonalPitchingResult";
import { usePersonalPitchingResultStats } from "@app/hooks/pitching/getPersonalPitchingResultStats";

type UserId = {
  userId: number;
};

export default function IndividualResultsList(props: UserId) {
  const { userId } = props;
  const { personalBattingAverages, isLoadingBA } =
    usePersonalBattingAverage(userId);
  const { personalBattingStatus, isLoadingBS } =
    usePersonalBattingStatus(userId);
  const { personalPitchingResults, isLoadingPR } =
    usePersonalPitchingResult(userId);
  const { personalPitchingStatus, isLoadingPS } =
    usePersonalPitchingResultStats(userId);

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
          {/* <ResultsSelectBox
            radius="full"
            defaultSelectedKeys={[years[0].label]}
            className="bg-transparent rounded-full text-xs border-zinc-400 max-w-xs"
            data={years}
            variant="faded"
            color="primary"
            ariaLabel="シーズンを選択"
            labelPlacement="outside"
            size="sm"
          />
          <ResultsSelectBox
            radius="full"
            defaultSelectedKeys={[gameType[0].label]}
            className="bg-transparent rounded-full text-xs border-zinc-400 max-w-xs"
            data={gameType}
            variant="faded"
            color="primary"
            ariaLabel="試合の種類を選択"
            labelPlacement="outside"
            size="sm"
          /> */}
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
