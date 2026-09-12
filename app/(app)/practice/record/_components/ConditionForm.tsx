"use client";

import type { ConditionDraft } from "../_utils/conditionDraft";
import type { Injury } from "@app/types/practice";
import { Input, Textarea } from "@heroui/react";
import {
  CONDITION_LEVELS,
  CONDITION_MOODS,
  type ConditionLevelKind,
} from "@app/constants/practice";
import InjuryInput from "./InjuryInput";
import {
  CONDITION_FATIGUE_LABEL,
  CONDITION_INJURY_LABEL,
  CONDITION_MEMO_LABEL,
  CONDITION_MEMO_PLACEHOLDER,
  CONDITION_MOOD_LABEL,
  CONDITION_PHYSICAL_LABEL,
  CONDITION_SLEEP_LABEL,
  CONDITION_SLEEP_UNIT,
  conditionLevelOptionLabel,
} from "./practiceRecordCopy";

interface ConditionFormProps {
  value: ConditionDraft;
  onChange: (next: ConditionDraft) => void;
}

const FIELD_LABEL_CLASS = "text-xs font-bold text-zinc-400";

interface LevelSelectorProps {
  kind: ConditionLevelKind;
  title: string;
  value: number | null;
  onSelect: (level: number | null) => void;
}

/**
 * 4段階の選択。色は悪い→良いで赤→緑に変わるが、
 * 色を認識できなくても段階が分かるよう表情の向き・塗りとテキストラベルを必ず添える。
 */
function LevelSelector({ kind, title, value, onSelect }: LevelSelectorProps) {
  return (
    <div>
      <p className={FIELD_LABEL_CLASS}>{title}</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {CONDITION_LEVELS.map((level) => {
          const label =
            kind === "fatigue" ? level.fatigueLabel : level.physicalLabel;
          const isSelected = value === level.value;
          const LevelIcon = level.icon;

          return (
            <button
              key={level.value}
              type="button"
              aria-pressed={isSelected}
              aria-label={conditionLevelOptionLabel(title, label)}
              onClick={() => onSelect(isSelected ? null : level.value)}
              className={`flex flex-col items-center gap-1 rounded-[10px] bg-sub px-1 py-2.5 ${
                isSelected ? "ring-2 ring-[#d08000]" : "ring-1 ring-transparent"
              }`}
            >
              <LevelIcon
                className={`h-6 w-6 shrink-0 ${level.colorClass}`}
                aria-hidden
              />
              <span
                className={`text-[11px] font-bold ${
                  isSelected ? "text-white" : "text-zinc-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * コンディション（疲労度・体調・睡眠・気分・怪我）の入力フォーム。
 * 値と onChange を親が持つ制御コンポーネントで、保存はセッション保存に相乗りする。
 */
export default function ConditionForm({ value, onChange }: ConditionFormProps) {
  const patch = (partial: Partial<ConditionDraft>) =>
    onChange({ ...value, ...partial });

  return (
    <div className="space-y-5">
      <LevelSelector
        kind="fatigue"
        title={CONDITION_FATIGUE_LABEL}
        value={value.fatigue_level}
        onSelect={(fatigue_level) => patch({ fatigue_level })}
      />
      <LevelSelector
        kind="physical"
        title={CONDITION_PHYSICAL_LABEL}
        value={value.physical_level}
        onSelect={(physical_level) => patch({ physical_level })}
      />

      <div>
        <p className={FIELD_LABEL_CLASS}>{CONDITION_SLEEP_LABEL}</p>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            size="sm"
            radius="sm"
            className="w-24"
            // back の sleep_hours は小数第1位まで（0〜24）。
            step={0.1}
            min={0}
            max={24}
            aria-label={CONDITION_SLEEP_LABEL}
            placeholder="7.0"
            value={value.sleep_hours}
            onChange={(event) => patch({ sleep_hours: event.target.value })}
          />
          <span className="text-sm text-zinc-400">{CONDITION_SLEEP_UNIT}</span>
        </div>
      </div>

      <div>
        <p className={FIELD_LABEL_CLASS}>{CONDITION_MOOD_LABEL}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONDITION_MOODS.map((mood) => {
            const isSelected = value.mood === mood;
            return (
              <button
                key={mood}
                type="button"
                aria-pressed={isSelected}
                onClick={() => patch({ mood: isSelected ? null : mood })}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  isSelected
                    ? "bg-[#d08000] text-white"
                    : "bg-sub text-zinc-400"
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
        <Textarea
          size="sm"
          radius="sm"
          minRows={2}
          className="mt-2"
          aria-label={CONDITION_MEMO_LABEL}
          placeholder={CONDITION_MEMO_PLACEHOLDER}
          value={value.memo}
          onChange={(event) => patch({ memo: event.target.value })}
        />
      </div>

      <div>
        <p className={FIELD_LABEL_CLASS}>{CONDITION_INJURY_LABEL}</p>
        <div className="mt-2">
          <InjuryInput
            injuries={value.injuries}
            onChange={(injuries: Injury[]) => patch({ injuries })}
          />
        </div>
      </div>
    </div>
  );
}
