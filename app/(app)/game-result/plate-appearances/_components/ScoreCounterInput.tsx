"use client";
import { Button, Input } from "@heroui/react";

export type ScoreCounterKey =
  | "rbi"
  | "runScored"
  | "stolenBases"
  | "caughtStealing";

interface ScoreCounterInputProps {
  rbi: number;
  runScored: number;
  stolenBases: number;
  caughtStealing: number;
  onChange: (key: ScoreCounterKey, value: number) => void;
}

const ROWS: { key: ScoreCounterKey; label: string }[] = [
  { key: "rbi", label: "打点" },
  { key: "runScored", label: "得点" },
  { key: "stolenBases", label: "盗塁" },
  { key: "caughtStealing", label: "盗塁死" },
];

/**
 * 打点・得点・盗塁・盗塁死を +/- ボタン + 手入力で増減する 4 行ブロック。
 * 値は 0 以上に制限する（0 のとき減少ボタンを disabled）。
 */
export function ScoreCounterInput({
  rbi,
  runScored,
  stolenBases,
  caughtStealing,
  onChange,
}: ScoreCounterInputProps) {
  const values: Record<ScoreCounterKey, number> = {
    rbi,
    runScored,
    stolenBases,
    caughtStealing,
  };

  return (
    <div className="flex flex-col gap-y-3">
      {ROWS.map((row) => {
        const value = values[row.key];
        const decrementDisabled = value <= 0;
        return (
          <div key={row.key} className="flex items-center justify-between">
            <span className="text-base">{row.label}</span>
            <div className="flex items-center gap-x-2">
              <Button
                isIconOnly
                radius="full"
                variant="solid"
                className={`h-8 w-8 min-w-8 text-lg ${
                  decrementDisabled
                    ? "bg-zinc-600 text-zinc-400"
                    : "bg-[#d08000] text-white"
                }`}
                aria-label={`${row.label}を減らす`}
                isDisabled={decrementDisabled}
                onPress={() => onChange(row.key, Math.max(0, value - 1))}
              >
                −
              </Button>
              <Input
                type="number"
                size="md"
                variant="bordered"
                min={0}
                aria-label={row.label}
                className="w-20"
                classNames={{ input: "text-center" }}
                value={String(value)}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  // 整数のみ。小数入力は切り捨てる。
                  onChange(
                    row.key,
                    Number.isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed)),
                  );
                }}
              />
              <Button
                isIconOnly
                radius="full"
                variant="solid"
                className="h-8 w-8 min-w-8 text-lg bg-[#d08000] text-white"
                aria-label={`${row.label}を増やす`}
                onPress={() => onChange(row.key, value + 1)}
              >
                +
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
