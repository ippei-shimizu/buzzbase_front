"use client";

/**
 * Pro プラン Coming soon カードのボカし対象ダミー body 群。
 * 数値はダミー固定値で、ブラーで読めなくなる前提のため正確さは不要。
 * 各機能のレイアウトに似せて「何ができる機能か」を視覚的に伝える役割を持つ。
 * 方向別の球場図は ProComingSoonHitDirectionField を参照。
 */

const COUNT_COLUMNS = [
  { label: "初球", average: ".333", count: "9打数 3安打" },
  { label: "有利カウント", average: ".286", count: "14打数 4安打" },
  { label: "追い込み", average: ".214", count: "28打数 6安打" },
];

export function CountSituationDummy() {
  return (
    <div className="flex gap-2">
      {COUNT_COLUMNS.map((column) => (
        <div
          key={column.label}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-[#27272A] px-1.5 py-2.5"
        >
          <span className="text-[11px] font-semibold text-[#A1A1AA]">
            {column.label}
          </span>
          <span className="text-[22px] font-extrabold text-[#F4F4F4]">
            {column.average}
          </span>
          <span className="text-[10px] text-[#71717A]">{column.count}</span>
        </div>
      ))}
    </div>
  );
}

const PITCH_TYPE_ROWS = [
  { label: "ストレート", average: ".342" },
  { label: "スライダー", average: ".289" },
  { label: "カーブ", average: ".200" },
];

export function PitchTypeDummy() {
  return (
    <div className="flex flex-col gap-2">
      {PITCH_TYPE_ROWS.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between rounded-lg bg-[#27272A] px-3 py-2.5"
        >
          <span className="text-[13px] font-semibold text-[#F4F4F4]">
            {row.label}
          </span>
          <span className="text-lg font-extrabold text-[#d08000]">
            {row.average}
          </span>
        </div>
      ))}
    </div>
  );
}

const PITCHER_FACEOFF_ROWS = [
  { name: "投手 A", average: ".375" },
  { name: "投手 B", average: ".300" },
  { name: "投手 C", average: ".231" },
];

export function PitcherFaceoffDummy() {
  return (
    <div className="flex flex-col gap-2">
      {PITCHER_FACEOFF_ROWS.map((row) => (
        <div
          key={row.name}
          className="flex items-center justify-between rounded-lg bg-[#27272A] px-3 py-2.5"
        >
          <span className="text-[13px] font-semibold text-[#F4F4F4]">
            {row.name}
          </span>
          <span className="text-lg font-extrabold text-[#d08000]">
            {row.average}
          </span>
        </div>
      ))}
    </div>
  );
}
