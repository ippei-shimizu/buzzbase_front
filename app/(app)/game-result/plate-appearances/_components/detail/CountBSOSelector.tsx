"use client";
import { BSOBoard, type BSOKey } from "@app/components/baseball/BSOBoard";

export type DetailCountKey = "finalBalls" | "finalStrikes" | "finalOuts";

interface CountBSOSelectorProps {
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  onChange: (key: DetailCountKey, value: number | null) => void;
  description?: string;
}

const DETAIL_KEY_BY_BSO: Record<BSOKey, DetailCountKey> = {
  balls: "finalBalls",
  strikes: "finalStrikes",
  outs: "finalOuts",
};

/**
 * 最終カウントを球場カウントボード風のドット UI で入力する。
 * 描画は共通の BSOBoard に委譲し、DetailState 向けのキー変換だけを担う。
 */
export function CountBSOSelector({
  balls,
  strikes,
  outs,
  onChange,
  description,
}: CountBSOSelectorProps) {
  return (
    <div className="flex flex-col gap-y-2 rounded-lg bg-[#1f1f1f] p-3">
      <div>
        <p className="text-sm font-medium">最終カウント</p>
        {description ? (
          <p className="text-xs text-zinc-400">{description}</p>
        ) : null}
      </div>
      <BSOBoard
        balls={balls}
        strikes={strikes}
        outs={outs}
        onChange={(key, value) => onChange(DETAIL_KEY_BY_BSO[key], value)}
      />
    </div>
  );
}
