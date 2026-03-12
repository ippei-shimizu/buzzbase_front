"use client";

import { Input } from "@heroui/react";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

interface GameSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function GameSearchInput({
  value,
  onChange,
}: GameSearchInputProps) {
  return (
    <Input
      size="sm"
      placeholder="対戦相手を検索"
      value={value}
      onValueChange={onChange}
      startContent={<SearchIcon />}
      isClearable
      onClear={() => onChange("")}
      classNames={{
        base: "flex-1",
        inputWrapper: "h-9 min-h-9 bg-transparent border-default-200 border",
        input: "text-sm",
      }}
    />
  );
}
