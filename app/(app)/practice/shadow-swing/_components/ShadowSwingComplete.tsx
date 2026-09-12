"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import Link from "next/link";
import {
  NO_SWING_MESSAGE,
  RETRY_BUTTON_LABEL,
  SAVED_MESSAGE,
  SAVE_FAILED_DESCRIPTION,
  SAVE_FAILED_TITLE,
  SAVING_MESSAGE,
} from "./shadowSwingCopy";
import ShadowSwingStatsCard from "./ShadowSwingStatsCard";

/** 完了 API の状態。失敗しても本数は画面に残し、再送で復帰できるようにする。 */
export type SaveState = "saving" | "saved" | "failed" | "skipped";

interface ShadowSwingCompleteProps {
  swingCount: number;
  saveState: SaveState;
  saveErrors: string[];
  statsResult: FetchResult<ShadowSwingStats>;
  onRetry: () => void;
  onRestart: () => void;
}

const NUMBER_LOCALE = "ja-JP";

/**
 * 素振りの完了画面。達成本数と今日 / 今月 / 通算の積み上げを表示する。
 * 保存に失敗しても本数の表示は変えず、再試行で同じ本数を送り直せるようにしている
 * （back の complete は冪等なので、成功していた場合に再送しても二重計上されない）。
 */
export default function ShadowSwingComplete({
  swingCount,
  saveState,
  saveErrors,
  statsResult,
  onRetry,
  onRestart,
}: ShadowSwingCompleteProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <CheckCircleIcon
        className="h-14 w-14 text-[#17C964] motion-safe:animate-swing-pop"
        aria-hidden
      />
      <h2 className="text-2xl font-extrabold text-white">
        {swingCount.toLocaleString(NUMBER_LOCALE)}本 達成！
      </h2>

      {saveState === "saving" ? (
        <p role="status" className="text-sm text-zinc-400">
          {SAVING_MESSAGE}
        </p>
      ) : null}
      {saveState === "saved" ? (
        <p role="status" className="text-sm text-zinc-400">
          {SAVED_MESSAGE}
        </p>
      ) : null}
      {saveState === "skipped" ? (
        <p role="status" className="text-sm text-zinc-400">
          {NO_SWING_MESSAGE}
        </p>
      ) : null}

      {saveState === "failed" ? (
        <div
          role="alert"
          className="w-full space-y-2 rounded-[10px] border border-red-500/60 bg-sub px-4 py-3"
        >
          <p className="text-sm font-bold text-red-400">{SAVE_FAILED_TITLE}</p>
          <p className="text-xs leading-[18px] text-zinc-300">
            {SAVE_FAILED_DESCRIPTION}
          </p>
          {saveErrors.length > 0 ? (
            <ul className="space-y-1 text-xs text-zinc-400">
              {saveErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 rounded-lg bg-[#d08000] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
          >
            {RETRY_BUTTON_LABEL}
          </button>
        </div>
      ) : null}

      <div className="w-full">
        <ShadowSwingStatsCard
          result={statsResult}
          isRefreshing={saveState === "saving"}
        />
      </div>

      <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 rounded-lg bg-sub py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
        >
          もう一度
        </button>
        <Link
          href="/practice/records"
          className="flex-1 rounded-lg bg-[#d08000] py-3.5 text-center text-base font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
        >
          練習記録を見る
        </Link>
      </div>
    </div>
  );
}
