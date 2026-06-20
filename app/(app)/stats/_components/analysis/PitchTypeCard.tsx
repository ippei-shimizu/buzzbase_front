"use client";
import type { PitchTypeData } from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";

interface PitchTypeCardProps {
  data: PitchTypeData;
}

/** 球種別の打撃成績テーブル（打席のある行のみ表示）。 */
export function PitchTypeCard({ data }: PitchTypeCardProps) {
  const rows = data.rows.filter((row) => row.plate_appearances > 0);
  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
      <h3 className="text-sm font-bold">球種別成績</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">対象データがありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400">
                <th className="text-left py-2 pr-3 sticky left-0 bg-bg_sub">
                  球種
                </th>
                <th className="text-right py-2 px-3">打席</th>
                <th className="text-right py-2 px-3">打数</th>
                <th className="text-right py-2 px-3">安打</th>
                <th className="text-right py-2 px-3">打率</th>
                <th className="text-right py-2 px-3">OPS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-zinc-700">
                  <td className="text-left py-2 pr-3 font-medium sticky left-0 bg-bg_sub">
                    {row.label}
                  </td>
                  <td className="text-right py-2 px-3">
                    {row.plate_appearances}
                  </td>
                  <td className="text-right py-2 px-3">{row.at_bats}</td>
                  <td className="text-right py-2 px-3">{row.hits}</td>
                  <td className="text-right py-2 px-3">
                    {formatRate(row.batting_average)}
                  </td>
                  <td className="text-right py-2 px-3">
                    {formatRate(row.ops)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
