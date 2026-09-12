"use client";
import type { CountSituation, CountSituations } from "../../analysisActions";
import { useState } from "react";
import { formatBattingAverage } from "@app/utils/formatStats";

interface CountSituationCardsProps {
  data: CountSituations;
}

interface CellConfig {
  key: "first_pitch" | "favorable_count" | "pinch_count";
  label: string;
  tooltip: string;
}

const CELLS: readonly CellConfig[] = [
  {
    key: "first_pitch",
    label: "初球",
    tooltip:
      "初球を振った打席だけを集計した打率です。積極性が分かる指標で、高いほど初球から打ちに行って結果を出していることを意味します。",
  },
  {
    key: "favorable_count",
    label: "有利カウント",
    tooltip:
      "最終カウントが「ボール > ストライク」になった打席（2-0、3-1 など）の打率です。打者有利のカウントでどれくらい仕留められているかが分かります。",
  },
  {
    key: "pinch_count",
    label: "追い込み",
    tooltip:
      "最終カウントのストライクが 2 だった打席（0-2、1-2、2-2、3-2 など）の打率です。追い込まれてから粘って結果を出した割合を示します。",
  },
] as const;

const formatAverage = (situation: CountSituation): string =>
  formatBattingAverage(situation.batting_average, situation.at_bats);

/** カウント別の打率（初球 / 有利カウント / 追い込み）。各セルの ? で説明を表示する。 */
export function CountSituationCards({ data }: CountSituationCardsProps) {
  const [openTooltipKey, setOpenTooltipKey] = useState<string | null>(null);
  const openCell = CELLS.find((cell) => cell.key === openTooltipKey) ?? null;

  if (data.total_target_pa === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">カウント別の打率</h3>
        <div className="flex flex-col items-center py-8">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            対象データなし
          </p>
          <p className="text-[11px] text-[#71717A]">
            新仕様で記録した打席のみが対象です
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">カウント別の打率</h3>
        <span className="text-[11px] text-[#A1A1AA]">
          対象 {data.total_target_pa} 打席
        </span>
      </div>

      <div className="flex gap-2">
        {CELLS.map((cell) => {
          const situation = data[cell.key];
          return (
            <div
              key={cell.key}
              className="flex flex-1 flex-col items-center rounded-lg bg-[#27272A] px-1.5 py-2.5"
            >
              <div className="mb-1 flex items-center gap-1">
                <span className="text-[11px] font-semibold text-[#A1A1AA]">
                  {cell.label}
                </span>
                <button
                  type="button"
                  aria-label={`${cell.label}の説明を表示`}
                  onClick={() => setOpenTooltipKey(cell.key)}
                  className="text-[#A1A1AA]"
                >
                  <HelpIcon />
                </button>
              </div>
              <span className="mb-1 text-[22px] font-extrabold text-[#F4F4F4]">
                {formatAverage(situation)}
              </span>
              <span className="text-[10px] text-[#71717A]">
                {situation.at_bats}打数 {situation.hits}安打
              </span>
            </div>
          );
        })}
      </div>

      {openCell ? (
        <button
          type="button"
          aria-label="説明を閉じる"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8"
          onClick={() => setOpenTooltipKey(null)}
        >
          <div className="w-full max-w-[320px] rounded-xl border border-[#3f3f46] bg-[#27272a] px-5 py-4 text-left">
            <p className="mb-1.5 text-sm font-bold text-[#d08000]">
              {openCell.label}
            </p>
            <p className="text-[13px] leading-relaxed text-[#F4F4F4]">
              {openCell.tooltip}
            </p>
          </div>
        </button>
      ) : null}
    </section>
  );
}

function HelpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
