"use client";

import type { StatsPeriod } from "../actions";

const OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "yearly", label: "年" },
  { value: "monthly", label: "月" },
  { value: "daily", label: "日" },
];

interface PeriodToggleProps {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}

export default function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div
      className="flex rounded-lg p-0.5 gap-0.5"
      style={{ backgroundColor: "#3A3A3A" }}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
          style={{
            backgroundColor: value === opt.value ? "#d08000" : "transparent",
            color: value === opt.value ? "#F4F4F4" : "#A1A1AA",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
