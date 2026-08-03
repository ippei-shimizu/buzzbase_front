"use client";

import type { NoteTag } from "@app/interface/baseballNoteV2";
import type { NoteListFilterValues } from "@app/utils/noteListFilter";
import FilterChipGroup from "@app/components/filter/FilterChipGroup";
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

/**
 * ノート一覧の絞り込みバー（フリーワード / 期間 / タグ）。
 *
 * 成績・試合一覧で使う FilterBar は「年・月粒度の単一選択ドロップダウン」専用で、
 * フリーワード・日単位の期間・複数選択タグを表現できないため、チップの並びだけ
 * FilterChipGroup を共有してノート専用のバーを組んでいる。
 */
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

  // 開始日が終了日より後になると常に0件になるため、片方を動かしたらもう片方を寄せる。
  const handleStartDate = (startDate: string) => {
    const endDate =
      values.endDate !== "" && startDate !== "" && values.endDate < startDate
        ? startDate
        : values.endDate;
    onChange({ ...values, startDate, endDate });
  };

  const handleEndDate = (endDate: string) => {
    const startDate =
      values.startDate !== "" && endDate !== "" && values.startDate > endDate
        ? endDate
        : values.startDate;
    onChange({ ...values, startDate, endDate });
  };

  return (
    <div className="space-y-3">
      <input
        type="search"
        aria-label="ノートを検索"
        placeholder="タイトル・本文・タグで検索"
        value={values.keyword}
        onChange={(event) =>
          onChange({ ...values, keyword: event.target.value })
        }
        className="w-full rounded-lg bg-sub px-3 py-2 text-sm text-white placeholder:text-zinc-500"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label="開始日"
          value={values.startDate}
          onChange={(event) => handleStartDate(event.target.value)}
          className="rounded-lg bg-sub px-3 py-2 text-sm text-white"
        />
        <span className="text-xs text-zinc-400">〜</span>
        <input
          type="date"
          aria-label="終了日"
          value={values.endDate}
          onChange={(event) => handleEndDate(event.target.value)}
          className="rounded-lg bg-sub px-3 py-2 text-sm text-white"
        />
        {hasActiveNoteFilter(values) ? (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_NOTE_FILTERS })}
            className="px-2 py-1.5 text-xs font-medium text-[#A1A1AA]"
          >
            クリア
          </button>
        ) : null}
      </div>
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
    </div>
  );
}
