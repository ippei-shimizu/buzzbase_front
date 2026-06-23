"use client";

import { useEffect, useState } from "react";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import Header from "@app/components/header/Header";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getCurrentUserId } from "@app/services/userService";
import { GameResultTabs } from "./_components/GameResultTabs";

export default function GameResultList() {
  const [currentUserId, setCurrentUserId] = useState(0);
  useRequireAuth();

  const fetchData = async () => {
    try {
      const currentUserIdData = await getCurrentUserId();
      setCurrentUserId(currentUserIdData);
    } catch {}
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <main className="h-full max-w-[720px] mx-auto w-full lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-12 px-4 lg:px-6 lg:pb-6">
            <GameResultTabs
              userId={currentUserId}
              adSlot={adSlots.gameResultListMiddleInFeed}
              adLayoutKey="-6t+ed+2i-1n-4w"
            />
            <AdInFeed
              slot={adSlots.gameResultListInFeed}
              layoutKey="-6t+ed+2i-1n-4w"
            />
          </div>
        </div>
      </main>
    </>
  );
}
