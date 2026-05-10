"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

interface Props {
  /** セルに表示するラベル文字列（例: "防御率"、"K/9"） */
  label: string;
  /** Popover内に表示する説明文 */
  tooltip: string;
  /** 親が当てているテーブルセルのスタイルをそのまま継承させるためのクラス */
  className?: string;
}

/**
 * 成績テーブルのラベルセル用ツールチップ。
 *
 * `<p>` で組まれた既存セルを置き換える形で使う。
 * クリックで HeroUI Popover を開き、計算式や前提条件などの補足を表示する。
 * 見た目は `className` 経由でセルの border / padding を継承し、ラベルテキストには
 * 「ツールチップを開ける」ことを示す dotted underline を付与する。
 */
export default function StatTooltipLabel({ label, tooltip, className }: Props) {
  return (
    <Popover placement="top" showArrow>
      <PopoverTrigger>
        <button
          type="button"
          className={`${className ?? ""} cursor-pointer w-full text-center underline decoration-dotted decoration-zinc-500 underline-offset-4`}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[240px] p-3">
        <p className="text-xs text-zinc-100 leading-snug">{tooltip}</p>
      </PopoverContent>
    </Popover>
  );
}
