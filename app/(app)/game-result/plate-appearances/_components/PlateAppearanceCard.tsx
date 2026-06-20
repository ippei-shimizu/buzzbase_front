"use client";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { Button } from "@heroui/react";
import { DeleteIcon } from "@app/components/icon/DeleteIcon";

interface PlateAppearanceCardProps {
  plateAppearance: PlateAppearanceV2;
  onEdit: () => void;
  onDelete: () => void;
}

const scoreChips = (pa: PlateAppearanceV2): string[] => {
  const chips: string[] = [];
  if (pa.rbi && pa.rbi > 0) chips.push(`打点${pa.rbi}`);
  if (pa.run_scored && pa.run_scored > 0) chips.push(`得点${pa.run_scored}`);
  if (pa.stolen_bases && pa.stolen_bases > 0)
    chips.push(`盗塁${pa.stolen_bases}`);
  if (pa.caught_stealing && pa.caught_stealing > 0)
    chips.push(`盗塁死${pa.caught_stealing}`);
  return chips;
};

/** 打席リストの1件カード。タップで編集、ゴミ箱で削除する。 */
export function PlateAppearanceCard({
  plateAppearance,
  onEdit,
  onDelete,
}: PlateAppearanceCardProps) {
  const chips = scoreChips(plateAppearance);
  return (
    <div className="flex items-center justify-between rounded-xl bg-bg_sub px-4 py-3">
      <button
        type="button"
        className="flex-1 text-left flex items-center gap-x-3"
        onClick={onEdit}
      >
        <span className="text-xs text-zinc-400 shrink-0">
          第{plateAppearance.batter_box_number}打席
        </span>
        <span className="font-bold">{plateAppearance.batting_result}</span>
        <span className="flex flex-wrap gap-1">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-200"
            >
              {chip}
            </span>
          ))}
          {!plateAppearance.has_detail_data ? (
            <span className="rounded-full border border-zinc-600 px-2 py-0.5 text-xs text-zinc-500">
              詳細未入力
            </span>
          ) : null}
        </span>
      </button>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        aria-label="この打席を削除"
        onPress={onDelete}
      >
        <DeleteIcon />
      </Button>
    </div>
  );
}
