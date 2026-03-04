"use client";

import type { SeasonData } from "@app/interface";
import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import Header from "@app/components/header/Header";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getSeasons } from "@app/services/seasonsService";
import SeasonsList from "./_components/SeasonsList";

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

  if (isLoading) {
    return (
      <div className="flex justify-center pb-12 buzz-dark flex-col w-full min-h-screen bg-main lg:max-w-[720px] lg:m-[0_auto_0_28%]">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="h-full">
        <div className="pb-40 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-12 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            <h1 className="text-xl font-medium text-center mb-6">
              シーズン管理
            </h1>
            <SeasonsList initialSeasons={seasons} />
          </div>
        </div>
      </main>
    </>
  );
}
