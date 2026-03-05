"use client";

import type { SeasonData } from "@app/interface";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import Header from "@app/components/header/Header";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getSeasons } from "@app/services/seasonsService";
import SeasonsList from "./_components/SeasonsList";

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

export default function SeasonsPage() {
  useRequireAuth();
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await getSeasons();
        setSeasons(data);
      } catch (error) {
        console.error("Failed to fetch seasons:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeasons();
  }, []);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
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
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner color="primary" />
                </div>
              ) : (
                <SeasonsList initialSeasons={seasons} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
