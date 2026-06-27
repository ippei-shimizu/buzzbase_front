"use client";

import type { OpponentRecord } from "../../gameSummaryTypes";
import { useState } from "react";
import { formatRate } from "@app/utils/formatStats";

interface OpponentRecordListProps {
  records: OpponentRecord[];
}

const INITIAL_SHOW = 3;

/** 対戦相手別の勝敗・勝率。3件を超える場合は展開トグルで全件表示する。 */
export function OpponentRecordList({ records }: OpponentRecordListProps) {
  const [expanded, setExpanded] = useState(false);

  if (records.length === 0) return null;

  const displayed = expanded ? records : records.slice(0, INITIAL_SHOW);

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">対戦相手別</h3>
      <div className="flex flex-col gap-1.5">
        {displayed.map((record) => {
          const winRate =
            record.wins + record.losses > 0
              ? formatRate(record.wins / (record.wins + record.losses))
              : ".000";
          return (
            <div
              key={record.team_name}
              className="flex items-center rounded-xl bg-[#3A3A3A] px-3 py-2.5"
            >
              <span className="flex-1 truncate text-sm text-[#F4F4F4]">
                {record.team_name}
              </span>
              <span className="ml-3 text-sm font-bold text-[#f31260]">
                {record.wins}勝
              </span>
              <span className="ml-3 text-sm font-bold text-[#006fee]">
                {record.losses}敗
              </span>
              <span className="ml-3 text-sm font-bold text-[#6b7280]">
                {record.draws}分
              </span>
              <span className="ml-3 min-w-9 text-right text-sm font-bold text-[#d08000]">
                {winRate}
              </span>
            </div>
          );
        })}
      </div>
      {records.length > INITIAL_SHOW ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full py-2 text-center text-xs text-[#71717A]"
        >
          {expanded ? "閉じる ▲" : "すべて表示 ▼"}
        </button>
      ) : null}
    </section>
  );
}
