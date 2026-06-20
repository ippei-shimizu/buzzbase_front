"use client";
import type { HitDirection } from "../../analysisActions";

interface HitDirectionTableProps {
  directions: HitDirection[];
}

const COLUMNS: { key: keyof HitDirection; label: string }[] = [
  { key: "count", label: "打席" },
  { key: "at_bats", label: "打数" },
  { key: "hits", label: "安打" },
  { key: "two_base_hit", label: "二塁打" },
  { key: "three_base_hit", label: "三塁打" },
  { key: "home_run", label: "本塁打" },
  { key: "total_bases", label: "塁打" },
];

/** 打球方向（13方向）別の打撃集計テーブル。 */
export function HitDirectionTable({ directions }: HitDirectionTableProps) {
  if (directions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">打球方向データがありません。</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400">
            <th className="text-left py-2 pr-3 sticky left-0 bg-bg_sub">
              方向
            </th>
            {COLUMNS.map((column) => (
              <th key={column.key} className="text-right py-2 px-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {directions.map((direction) => (
            <tr key={direction.id} className="border-t border-zinc-700">
              <td className="text-left py-2 pr-3 font-medium sticky left-0 bg-bg_sub">
                {direction.label}
              </td>
              {COLUMNS.map((column) => (
                <td key={column.key} className="text-right py-2 px-3">
                  {direction[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
