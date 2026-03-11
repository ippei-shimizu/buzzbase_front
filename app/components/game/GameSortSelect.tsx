"use client";

import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const SORT_OPTIONS = [
  {
    key: "date_desc",
    label: "日付（新しい順）",
    sortBy: "date",
    sortOrder: "desc",
  },
  {
    key: "date_asc",
    label: "日付（古い順）",
    sortBy: "date",
    sortOrder: "asc",
  },
  {
    key: "my_score_desc",
    label: "自チームスコア（高い順）",
    sortBy: "my_score",
    sortOrder: "desc",
  },
  {
    key: "opponent_score_desc",
    label: "相手スコア（高い順）",
    sortBy: "opponent_score",
    sortOrder: "desc",
  },
] as const;

interface GameSortSelectProps {
  sortBy: string;
  sortOrder: string;
  onChange: (sortBy: string, sortOrder: string) => void;
}

export default function GameSortSelect({
  sortBy,
  sortOrder,
  onChange,
}: GameSortSelectProps) {
  const currentKey = `${sortBy}_${sortOrder}`;
  const currentOption = SORT_OPTIONS.find((opt) => opt.key === currentKey);
  const isDefault = currentKey === "date_desc";

  return (
    <Dropdown>
      <DropdownTrigger>
        <Chip
          as="button"
          variant="bordered"
          color="default"
          size="sm"
          endContent={<ChevronDownIcon />}
          style={!isDefault ? { color: "#d08000" } : undefined}
          classNames={{
            base: `cursor-pointer whitespace-nowrap h-7 ${!isDefault ? "border-[#d08000]/40" : ""}`,
            content: "text-xs font-medium",
          }}
        >
          {currentOption?.label ?? "日付（新しい順）"}
        </Chip>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="並び替えを選択"
        selectionMode="single"
        selectedKeys={new Set([currentKey])}
        onSelectionChange={(keys) => {
          if (keys === "all") return;
          const selected = Array.from(keys)[0]?.toString();
          const option = SORT_OPTIONS.find((opt) => opt.key === selected);
          if (option) {
            onChange(option.sortBy, option.sortOrder);
          }
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
