"use client";

import type { Injury } from "@app/types/practice";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { Input } from "@heroui/react";
import { INJURY_PARTS } from "@app/constants/practice";
import {
  INJURY_ADD_LABEL,
  INJURY_MEMO_PLACEHOLDER,
  injuryMemoLabel,
  injuryPartLabel,
  injuryRemoveLabel,
  injuryRowLabel,
} from "./practiceRecordCopy";

interface InjuryInputProps {
  injuries: Injury[];
  onChange: (injuries: Injury[]) => void;
}

/**
 * 怪我・痛みの入力。部位プリセット＋任意の自由メモを1件ずつ足していく。
 * 部位は back が jsonb の自由文字列で持つため、プリセットは入力補助として扱う。
 */
export default function InjuryInput({ injuries, onChange }: InjuryInputProps) {
  const handleAdd = () =>
    onChange([...injuries, { part: INJURY_PARTS[0], memo: "" }]);

  const handleUpdate = (index: number, patch: Partial<Injury>) =>
    onChange(
      injuries.map((injury, i) =>
        i === index ? { ...injury, ...patch } : injury,
      ),
    );

  const handleRemove = (index: number) =>
    onChange(injuries.filter((_, i) => i !== index));

  return (
    <div>
      <ul className="space-y-2">
        {injuries.map((injury, index) => (
          <li
            // 並べ替えはせず、値は props から描画するため index を key にしてよい。
            key={index}
            className="rounded-[10px] bg-[#3A3A3A] p-2.5"
            aria-label={injuryRowLabel(index)}
          >
            <div className="flex flex-wrap gap-1.5">
              {INJURY_PARTS.map((part) => {
                const isSelected = part === injury.part;
                return (
                  <button
                    key={part}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={injuryPartLabel(index, part)}
                    onClick={() => handleUpdate(index, { part })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-[#d08000] text-white"
                        : "bg-sub text-zinc-400"
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                size="sm"
                radius="sm"
                className="flex-1"
                aria-label={injuryMemoLabel(index)}
                placeholder={INJURY_MEMO_PLACEHOLDER}
                value={injury.memo ?? ""}
                onChange={(event) =>
                  handleUpdate(index, { memo: event.target.value })
                }
              />
              <button
                type="button"
                aria-label={injuryRemoveLabel(index)}
                onClick={() => handleRemove(index)}
                className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:text-white"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 inline-flex items-center gap-1 py-1.5 text-sm font-bold text-[#d08000]"
      >
        <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
        {INJURY_ADD_LABEL}
      </button>
    </div>
  );
}
