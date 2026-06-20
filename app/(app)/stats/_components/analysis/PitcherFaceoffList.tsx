"use client";
import type { PitcherFaceoffData } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface PitcherFaceoffListProps {
  data: PitcherFaceoffData;
}

/** 対戦投手別の打撃成績リスト。 */
export function PitcherFaceoffList({ data }: PitcherFaceoffListProps) {
  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
      <h3 className="text-sm font-bold">対戦投手別</h3>
      {data.rows.length === 0 ? (
        <p className="text-sm text-zinc-500">
          対象データがありません（対戦数 {data.min_plate_appearances}{" "}
          以上の投手が対象）。
        </p>
      ) : (
        <div className="flex flex-col gap-y-2">
          {data.rows.map((row) => (
            <div
              key={row.pitcher_id}
              className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{row.pitcher_name}</span>
                <span className="text-xs text-zinc-400">
                  {row.plate_appearances}打席 / 最多: {row.top_result}
                </span>
              </div>
              <div className="flex gap-x-4 text-right">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400">打率</span>
                  <span className="text-sm font-bold">
                    {formatRate(row.batting_average)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400">OPS</span>
                  <span className="text-sm font-bold">
                    {formatRate(row.ops)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
