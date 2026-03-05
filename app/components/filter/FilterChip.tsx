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

interface FilterChipProps {
  label: string;
  value: string;
  defaultValue: string;
  options: { key: string; label: string }[];
  onChange: (key: string) => void;
}

export default function FilterChip({
  label,
  value,
  defaultValue,
  options,
  onChange,
}: FilterChipProps) {
  const isFiltered = value !== defaultValue;
  const displayValue = options.find((opt) => opt.key === value)?.label ?? value;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Chip
          as="button"
          variant="bordered"
          color="default"
          size="sm"
          endContent={<ChevronDownIcon />}
          style={isFiltered ? { color: "#d08000" } : undefined}
          classNames={{
            base: `cursor-pointer whitespace-nowrap h-7 ${isFiltered ? "border-[#d08000]/40" : ""}`,
            content: "text-xs font-medium",
          }}
        >
          {label}: {displayValue}
        </Chip>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${label}を選択`}
        selectionMode="single"
        selectedKeys={new Set([value])}
        onSelectionChange={(keys) => {
          if (keys === "all") return;
          const selected = Array.from(keys)[0]?.toString();
          if (selected) onChange(selected);
        }}
      >
        {options.map((opt) => (
          <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
