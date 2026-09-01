"use client";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import Link from "next/link";
import { getBattingResultColor } from "@app/utils/battingResultColor";
import {
  buildPitchAndPitcherChips,
  buildSituationChips,
} from "@app/utils/plateAppearanceChips";

interface PlateAppearanceSummaryCardProps {
  plateAppearance: PlateAppearanceV2;
}

/**
 * 試合サマリー画面で1打席分の詳細を表示するカード。
 * タップで打席詳細画面（閲覧専用）へ遷移する。
 */
export function PlateAppearanceSummaryCard({
  plateAppearance,
}: PlateAppearanceSummaryCardProps) {
  const resultText = plateAppearance.batting_result || "未入力";
  const resultColor = getBattingResultColor(resultText);
  const situationChips = buildSituationChips(plateAppearance);
  const pitchChips = buildPitchAndPitcherChips(plateAppearance);
  const hasAnyDetail = situationChips.length > 0 || pitchChips.length > 0;

  return (
    <Link
      href={`/game-result/plate-appearances/${plateAppearance.id}`}
      className="flex items-center gap-x-2 rounded-lg border border-zinc-600 bg-[#2E2E2E] px-2.5 py-2 transition-colors hover:border-zinc-400"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-y-1.5">
        <div className="flex items-center gap-x-2.5">
          <span className="text-xs text-zinc-400">
            第{plateAppearance.batter_box_number}打席
          </span>
          <span className="text-sm font-bold" style={{ color: resultColor }}>
            {resultText}
          </span>
        </div>
        {hasAnyDetail ? (
          <>
            {situationChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {situationChips.map((chip) => (
                  <span
                    key={`s-${chip}`}
                    className="rounded-md bg-[#424242] px-2 py-0.5 text-[11px] text-zinc-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
            {pitchChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pitchChips.map((chip) => (
                  <span
                    key={`p-${chip}`}
                    className="rounded-md border border-[#d08000] bg-[#3a3024] px-2 py-0.5 text-[11px] text-zinc-100"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-[11px] text-zinc-500">詳細未入力</span>
        )}
      </div>
      <span aria-hidden="true" className="shrink-0 text-zinc-500">
        ›
      </span>
    </Link>
  );
}
