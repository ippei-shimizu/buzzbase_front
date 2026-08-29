"use client";

import type { NoteTag } from "@app/interface/baseballNoteV2";
import type { NoteListFilterValues } from "@app/utils/noteListFilter";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
import RecordSearchFilterBar from "@app/components/filter/RecordSearchFilterBar";
import {
  EMPTY_NOTE_FILTERS,
  hasActiveNoteFilter,
} from "@app/utils/noteListFilter";
import { tagLabel } from "@app/utils/noteTags";

interface NoteListFilterBarProps {
  values: NoteListFilterValues;
  onChange: (values: NoteListFilterValues) => void;
  /** タグチップの候補。取得に失敗した場合は空配列を渡してチップを出さない。 */
  tags: NoteTag[];
}

/** ノート一覧の絞り込みバー。共通の検索バーへタグチップを差し込んで組み立てる。 */
export default function NoteListFilterBar({
  values,
  onChange,
  tags,
}: NoteListFilterBarProps) {
  const toggleTag = (id: number) => {
    onChange({
      ...values,
      tagIds: values.tagIds.includes(id)
        ? values.tagIds.filter((selected) => selected !== id)
        : [...values.tagIds, id],
    });
  };

  return (
    <RecordSearchFilterBar
      values={values}
      onChange={(next) => onChange({ ...values, ...next })}
      onClear={() => onChange({ ...EMPTY_NOTE_FILTERS })}
      showClear={hasActiveNoteFilter(values)}
      searchLabel="ノートを検索"
      searchPlaceholder="タイトル・本文・タグで検索"
    >
      {tags.length > 0 ? (
        <FilterChipGroup wrap>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              aria-pressed={values.tagIds.includes(tag.id)}
              onClick={() => toggleTag(tag.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                values.tagIds.includes(tag.id)
                  ? "bg-[#d08000] text-white"
                  : "bg-sub text-zinc-400 hover:text-white"
              }`}
            >
              {tagLabel(tag.name)}
            </button>
          ))}
        </FilterChipGroup>
      ) : null}
    </RecordSearchFilterBar>
  );
}
