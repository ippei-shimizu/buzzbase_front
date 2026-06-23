"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@app/components/icon/PlusIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import MatchResultList from "@app/components/user/MatchResultList";
import {
  GAME_RECORD_EDIT_MODE_STORAGE_KEY,
  RECORD_PATTERN_STORAGE_KEY,
} from "@app/constants/gameRecord";
import { createGameResult } from "@app/services/gameResultsService";
import { GameSummaryContainer } from "./GameSummaryContainer";

type ScreenTab = "summary" | "list";

const TABS: { key: ScreenTab; label: string }[] = [
  { key: "summary", label: "サマリー" },
  { key: "list", label: "一覧" },
];

interface GameResultTabsProps {
  userId: number;
  adSlot: string;
  adLayoutKey: string;
}

/**
 * 試合結果画面のタブ（成績画面と同じ下線タブUI）。先頭（既定）が「サマリー」、次が「一覧」。
 * タブ直下に mobile と同じ「試合結果を記録する」ボタンを配置する。
 */
export function GameResultTabs({
  userId,
  adSlot,
  adLayoutKey,
}: GameResultTabsProps) {
  const [tab, setTab] = useState<ScreenTab>("summary");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleNewRecord = async () => {
    setIsSubmitting(true);
    try {
      const newGameResult = await createGameResult();
      localStorage.setItem("gameResultId", JSON.stringify(newGameResult.id));
      // 新規記録フローなので編集フラグと前回のパターンをクリアする。
      localStorage.removeItem(GAME_RECORD_EDIT_MODE_STORAGE_KEY);
      localStorage.removeItem(RECORD_PATTERN_STORAGE_KEY);
      router.push(`/game-result/record`);
    } catch {}
  };

  return (
    <div>
      {isSubmitting ? <LoadingSpinner /> : null}

      <div className="flex" style={{ borderBottom: "1px solid #424242" }}>
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className="flex-1 py-3 text-center text-sm font-semibold"
            style={{
              borderBottom:
                tab === item.key
                  ? "2px solid #d08000"
                  : "2px solid transparent",
              color: tab === item.key ? "#F4F4F4" : "#A1A1AA",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNewRecord}
        disabled={isSubmitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#d08000] py-3 font-bold text-white disabled:opacity-60"
      >
        <PlusIcon width="20" height="20" fill="#FFFFFF" />
        試合結果を記録する
      </button>

      <div className="mt-5">
        {tab === "summary" ? (
          <GameSummaryContainer />
        ) : (
          <MatchResultList
            userId={userId}
            adSlot={adSlot}
            adLayoutKey={adLayoutKey}
          />
        )}
      </div>
    </div>
  );
}
