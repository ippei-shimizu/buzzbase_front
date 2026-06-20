"use client";

export type DetailCountKey = "finalBalls" | "finalStrikes" | "finalOuts";

interface CountBSOSelectorProps {
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  onChange: (key: DetailCountKey, value: number | null) => void;
}

const ROWS: {
  key: DetailCountKey;
  label: string;
  max: number;
  color: string;
}[] = [
  { key: "finalBalls", label: "ボール", max: 3, color: "#22c55e" },
  { key: "finalStrikes", label: "ストライク", max: 2, color: "#eab308" },
  { key: "finalOuts", label: "アウト", max: 2, color: "#ef4444" },
];

/**
 * 最終カウントを球場カウントボード風のドット UI で入力する。
 * ドット i をタップで値を i+1 に、点灯済みの最後のドット再タップで 1 段下げる。
 */
export function CountBSOSelector({
  balls,
  strikes,
  outs,
  onChange,
}: CountBSOSelectorProps) {
  const values: Record<DetailCountKey, number | null> = {
    finalBalls: balls,
    finalStrikes: strikes,
    finalOuts: outs,
  };

  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-sm font-medium">最終カウント</p>
      <div className="flex flex-col gap-y-2">
        {ROWS.map((row) => {
          const current = values[row.key] ?? 0;
          return (
            <div key={row.key} className="flex items-center justify-between">
              <span className="text-xs text-zinc-300 w-20">{row.label}</span>
              <div className="flex gap-x-2">
                {Array.from({ length: row.max }).map((_, index) => {
                  const lit = index < current;
                  const isLastLit = index === current - 1;
                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`${row.label} ${index + 1}`}
                      className="h-6 w-6 rounded-full border-2"
                      style={{
                        borderColor: row.color,
                        backgroundColor: lit ? row.color : "transparent",
                      }}
                      onClick={() =>
                        onChange(row.key, isLastLit ? index : index + 1)
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
