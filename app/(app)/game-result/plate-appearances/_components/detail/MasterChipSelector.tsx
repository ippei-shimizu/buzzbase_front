"use client";
import type { MasterItem } from "@app/interface/plateAppearanceMasters";

interface MasterChipSelectorProps {
  label: string;
  description?: string;
  options: MasterItem[];
  value: number | null;
  onChange: (id: number | null) => void;
  isError?: boolean;
}

/**
 * マスタ（球質 / タイミング / 球種 / 登板状況など）を1つだけ選ぶチップ群。
 * 選択済みのチップを再度押すと未選択(null)に戻す。
 */
export function MasterChipSelector({
  label,
  description,
  options,
  value,
  onChange,
  isError,
}: MasterChipSelectorProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-xs text-zinc-400">{description}</p>
        ) : null}
      </div>
      {isError ? (
        <p className="text-xs text-red-500">{label}の取得に失敗しました</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  isSelected
                    ? "border-[#d08000] bg-[#d08000] text-white"
                    : "border-zinc-500 text-zinc-200"
                }`}
                onClick={() => onChange(isSelected ? null : option.id)}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
