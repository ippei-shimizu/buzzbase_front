"use client";

export type BSOKey = "balls" | "strikes" | "outs";

interface BSOBoardProps {
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  /** 未指定なら表示専用モード（支援技術にはラベル文字列のみを公開する）。 */
  onChange?: (key: BSOKey, value: number | null) => void;
}

const ROWS: ReadonlyArray<{
  key: BSOKey;
  label: string;
  max: number;
  color: string;
}> = [
  { key: "balls", label: "ボール", max: 3, color: "#22c55e" },
  { key: "strikes", label: "ストライク", max: 2, color: "#eab308" },
  { key: "outs", label: "アウト", max: 2, color: "#ef4444" },
];

/**
 * 球場カウントボード風の BSO ドット表示。
 * onChange 指定時は入力モード（ドット i タップで i+1、点灯済み最後尾の再タップで 1 段下げ）、
 * 未指定時は表示専用（role=img、null は消灯のまま描画）として振る舞う。
 */
export function BSOBoard({ balls, strikes, outs, onChange }: BSOBoardProps) {
  const values: Record<BSOKey, number | null> = { balls, strikes, outs };
  const isInteractive = onChange !== undefined;

  const board = (
    <div className="flex flex-col gap-y-2">
      {ROWS.map((row) => {
        const current = values[row.key] ?? 0;
        return (
          <div key={row.key} className="flex items-center gap-x-4">
            <span className="w-24 text-xs text-zinc-300">{row.label}</span>
            {/* ラベルの直後にドットを左揃え。本数が違っても各行の先頭ドットが縦に揃う。 */}
            <div className="flex w-24 justify-start gap-x-2">
              {Array.from({ length: row.max }).map((_, index) => {
                const lit = index < current;
                const isLastLit = index === current - 1;
                const style = {
                  borderColor: row.color,
                  backgroundColor: lit ? row.color : "transparent",
                };
                return isInteractive ? (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${row.label} ${index + 1}`}
                    className="h-6 w-6 rounded-full border-2"
                    style={style}
                    onClick={() =>
                      onChange?.(row.key, isLastLit ? index : index + 1)
                    }
                  />
                ) : (
                  <span
                    key={index}
                    className="h-6 w-6 rounded-full border-2"
                    style={style}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (!isInteractive) {
    const describe = (value: number | null) =>
      value === null ? "未記録" : String(value);
    return (
      <div
        role="img"
        aria-label={`カウント ボール${describe(balls)} ストライク${describe(strikes)} アウト${describe(outs)}`}
      >
        <div aria-hidden="true">{board}</div>
      </div>
    );
  }

  return board;
}
