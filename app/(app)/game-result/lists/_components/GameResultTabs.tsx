"use client";

import { Tab, Tabs } from "@heroui/react";
import MatchResultList from "@app/components/user/MatchResultList";
import { GameSummaryContainer } from "./GameSummaryContainer";

interface GameResultTabsProps {
  userId: number;
  adSlot: string;
  adLayoutKey: string;
}

/**
 * 試合結果画面のタブ。先頭（既定）が「サマリー」、次が「一覧」。
 * HeroUI は非アクティブタブを unmount するため、一覧タブは開くまで取得しない。
 */
export function GameResultTabs({
  userId,
  adSlot,
  adLayoutKey,
}: GameResultTabsProps) {
  return (
    <Tabs
      color="primary"
      size="lg"
      aria-label="試合結果タブ"
      radius="lg"
      className="w-full grid sticky top-10 z-50"
    >
      <Tab key="summary" title="サマリー" className="font-bold tracking-wide">
        <GameSummaryContainer />
      </Tab>
      <Tab key="list" title="一覧" className="font-bold tracking-wide">
        <MatchResultList
          userId={userId}
          adSlot={adSlot}
          adLayoutKey={adLayoutKey}
        />
      </Tab>
    </Tabs>
  );
}
