"use client";

import type { SeasonData } from "@app/interface";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import SeasonsList from "./SeasonsList";

function InfoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

type SeasonsContentProps = {
  initialSeasons: SeasonData[];
};

export default function SeasonsContent({
  initialSeasons,
}: SeasonsContentProps) {
  return (
    <>
      <div className="flex items-center gap-x-2">
        <h2 className="text-2xl font-bold">シーズン管理</h2>
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <button
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="シーズンについて"
            >
              <InfoIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs p-4">
            <div className="space-y-2 text-sm">
              <p className="font-bold text-base">シーズンとは？</p>
              <p className="text-zinc-300">
                チームや期間ごとに試合をグループ分けするための機能です。
              </p>
              <p className="font-bold mt-3">活用例</p>
              <ul className="list-disc pl-4 text-zinc-300 space-y-1">
                <li>「2024年春季」「2024年秋季」など期間で分ける</li>
                <li>「〇〇高校」「〇〇大学」などチーム移籍時に分ける</li>
                <li>「新チーム」「旧チーム」で世代ごとに分ける</li>
              </ul>
              <p className="font-bold mt-3">使い方</p>
              <p className="text-zinc-300">
                試合結果の登録時にシーズンを選択すると、成績や試合一覧をシーズンごとに絞り込めます。
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="my-6">
        <SeasonsList initialSeasons={initialSeasons} />
      </div>
    </>
  );
}
