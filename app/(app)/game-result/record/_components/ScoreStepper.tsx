"use client";
import { Button, Input } from "@heroui/react";

interface ScoreStepperProps {
  value: number | null;
  onChange: (next: number | null) => void;
  ariaLabel: string;
  placeholder?: string;
  isValid?: boolean;
}

/**
 * 点数入力欄。+/- ボタンで増減でき、キーボード手入力も併用する。
 * 空欄は null（未入力）として扱い、0（完封）と区別する。
 */
export default function ScoreStepper({
  value,
  onChange,
  ariaLabel,
  placeholder,
  isValid = true,
}: ScoreStepperProps) {
  const decrementDisabled = value === null || value <= 0;

  return (
    <div className="flex items-center gap-x-1">
      <Button
        isIconOnly
        size="sm"
        radius="full"
        variant="light"
        color="primary"
        aria-label={`${ariaLabel}を減らす`}
        isDisabled={decrementDisabled}
        onPress={() => onChange(Math.max(0, (value ?? 0) - 1))}
      >
        −
      </Button>
      <Input
        type="number"
        size="md"
        variant="bordered"
        min={0}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="w-16"
        color={isValid ? "default" : "danger"}
        value={value !== null ? String(value) : ""}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const parsed = Number(raw);
          if (!Number.isNaN(parsed)) onChange(Math.max(0, parsed));
        }}
      />
      <Button
        isIconOnly
        size="sm"
        radius="full"
        variant="light"
        color="primary"
        aria-label={`${ariaLabel}を増やす`}
        onPress={() => onChange((value ?? 0) + 1)}
      >
        ＋
      </Button>
    </div>
  );
}
