"use client";
import type { RunnersState } from "@app/interface/plateAppearanceV2";
import { Button, Input, Textarea } from "@heroui/react";
import { RUNNERS_STATE_OPTIONS } from "@app/constants/runnersState";

/** 詳細項目のラベル + 説明文（mobile 同様、各項目に1文の説明を出す）。 */
export function FieldLabel({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description ? (
        <p className="text-xs text-zinc-400">{description}</p>
      ) : null}
    </div>
  );
}

interface FirstPitchSwingToggleProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  description?: string;
}

/** 初球打ち（1球目で打席結果が決まったか）を はい/いいえ で選ぶ。再選択で解除。 */
export function FirstPitchSwingToggle({
  value,
  onChange,
  description,
}: FirstPitchSwingToggleProps) {
  const OPTIONS: { label: string; value: boolean }[] = [
    { label: "はい", value: true },
    { label: "いいえ", value: false },
  ];
  return (
    <div className="flex flex-col gap-y-2">
      <FieldLabel label="初球打ち" description={description} />
      <div className="flex gap-x-2">
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <Button
              key={option.label}
              size="sm"
              radius="sm"
              variant={isSelected ? "solid" : "bordered"}
              className={
                isSelected
                  ? "border-2 border-[#d08000] bg-[#d08000] text-white"
                  : "border-2 border-[#d08000] bg-transparent text-[#d08000]"
              }
              onPress={() => onChange(isSelected ? null : option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

interface RunnersStateSelectorProps {
  value: RunnersState | null;
  onChange: (value: RunnersState | null) => void;
  description?: string;
}

/** ランナー状況をチップで選ぶ。再選択で解除。 */
export function RunnersStateSelector({
  value,
  onChange,
  description,
}: RunnersStateSelectorProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <FieldLabel label="ランナー状況" description={description} />
      <div className="flex flex-wrap gap-2">
        {RUNNERS_STATE_OPTIONS.map((option) => {
          const isSelected = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? "border-[#d08000] bg-[#d08000] text-white"
                  : "border-zinc-500 text-zinc-200"
              }`}
              onClick={() => onChange(isSelected ? null : option.key)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface InningStepperProps {
  value: number | null;
  onChange: (value: number | null) => void;
  description?: string;
}

/** イニングを +/- と手入力で設定する（1 以上、空欄は未入力）。 */
export function InningStepper({
  value,
  onChange,
  description,
}: InningStepperProps) {
  const decrementDisabled = value === null || value <= 1;
  return (
    <div className="flex flex-col gap-y-2">
      <FieldLabel label="イニング" description={description} />
      <div className="flex items-center gap-x-1">
        <Button
          isIconOnly
          radius="full"
          variant="solid"
          className={`h-8 w-8 min-w-8 text-lg ${
            decrementDisabled
              ? "bg-zinc-600 text-zinc-400"
              : "bg-[#d08000] text-white"
          }`}
          aria-label="イニングを減らす"
          isDisabled={decrementDisabled}
          onPress={() => onChange(Math.max(1, (value ?? 1) - 1))}
        >
          −
        </Button>
        <Input
          type="number"
          size="md"
          variant="bordered"
          min={1}
          aria-label="イニング"
          className="w-16"
          value={value !== null ? String(value) : ""}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) onChange(Math.max(1, parsed));
          }}
        />
        <Button
          isIconOnly
          radius="full"
          variant="solid"
          className="h-8 w-8 min-w-8 text-lg bg-[#d08000] text-white"
          aria-label="イニングを増やす"
          onPress={() => onChange((value ?? 0) + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

interface MemoTextAreaProps {
  value: string | null;
  onChange: (value: string) => void;
  description?: string;
}

/** 自己分析メモ。 */
export function MemoTextArea({
  value,
  onChange,
  description,
}: MemoTextAreaProps) {
  return (
    <Textarea
      variant="bordered"
      label="自己分析メモ"
      labelPlacement="outside"
      description={description}
      placeholder="例: 高めの球に手が出てしまった"
      maxLength={1000}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
