"use client";

import type { SeasonData } from "@app/interface";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import SeasonManageLink from "@app/components/season/SeasonManageLink";

interface SeasonFieldProps {
  seasons: SeasonData[];
  selectedSeason: number | null;
  onInputChange: (value: string) => void;
  onSelectionChange: (value: React.Key | null) => void;
}

/**
 * 試合結果登録のシーズン入力欄。
 *
 * 候補が 0 件だとシーズン機能の存在に気付けないため、そのときは
 * シーズン管理画面への導線を作成の入口として明示する。
 */
export default function SeasonField({
  seasons,
  selectedSeason,
  onInputChange,
  onSelectionChange,
}: SeasonFieldProps) {
  return (
    <div>
      <Autocomplete
        allowsCustomValue
        label="シーズン"
        variant="bordered"
        placeholder="シーズン名を入力"
        labelPlacement="outside-left"
        className="[&>div]:justify-between [&>div&>label]:whitespace-nowrap"
        size="md"
        onInputChange={onInputChange}
        onSelectionChange={onSelectionChange}
        selectedKey={selectedSeason !== null ? selectedSeason.toString() : null}
      >
        {seasons.map((season) => (
          <AutocompleteItem key={season.id}>{season.name}</AutocompleteItem>
        ))}
      </Autocomplete>
      <div className="mt-2 flex justify-end">
        {seasons.length === 0 ? (
          <SeasonManageLink label="シーズンがありません。シーズンを登録する" />
        ) : (
          <SeasonManageLink />
        )}
      </div>
    </div>
  );
}
