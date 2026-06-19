"use client";
import type { RecordPattern } from "@app/interface/gameRecord";
import { Button } from "@heroui/react";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import { RECORD_PATTERN_OPTIONS } from "@app/constants/gameRecord";

interface PatternSelectorProps {
  onSelect: (pattern: RecordPattern) => void;
  disabled?: boolean;
}

/**
 * 記録パターン（打撃のみ / 投手のみ / 両方）を選ぶ3ボタン。
 * 押下したパターンを onSelect で親に渡し、親が送信と遷移を行う。
 */
export default function PatternSelector({
  onSelect,
  disabled,
}: PatternSelectorProps) {
  return (
    <div className="flex flex-col gap-y-3">
      {RECORD_PATTERN_OPTIONS.map((option) => {
        const isPrimary = option.emphasis === "primary";
        return (
          <Button
            key={option.pattern}
            color="primary"
            variant={isPrimary ? "solid" : "bordered"}
            size="lg"
            radius="sm"
            type="button"
            className="w-full justify-between font-bold text-base"
            isDisabled={disabled}
            onPress={() => onSelect(option.pattern)}
            endContent={
              <NextArrowIcon stroke={isPrimary ? "#F4F4F4" : "#d08000"} />
            }
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
