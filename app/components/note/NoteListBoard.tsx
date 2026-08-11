"use client";

import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { NoteListFilterValues } from "@app/utils/noteListFilter";
import { useState } from "react";
import MonthPaginator from "@app/components/filter/MonthPaginator";
import NoteListFilterBar from "@app/components/note/NoteListFilterBar";
import NoteListItem from "@app/components/note/NoteListItem";
import { useMonthPager } from "@app/hooks/records/useMonthPager";
import {
  EMPTY_NOTE_FILTERS,
  filterNotes,
  noteDate,
} from "@app/utils/noteListFilter";

interface NoteListBoardProps {
  notes: BaseballNoteV2[];
  tags: NoteTag[];
}

/**
 * 絞り込み済みノートを月単位で1ページずつ表示する。
 * ページ送りの対象はノートが存在する月だけ（記録の無い月を空ページとして挟まない）。
 */
export default function NoteListBoard({ notes, tags }: NoteListBoardProps) {
  const [filters, setFilters] = useState<NoteListFilterValues>(
    () => EMPTY_NOTE_FILTERS,
  );

  const filtered = filterNotes(notes, filters);
  const pager = useMonthPager(filtered, noteDate);

  // 絞り込みを変えたら必ず最新の月へ戻す。古いページ番号のまま検索すると
  // 該当ノートがあるのに「結果なし」に見えてしまう。
  const handleFilterChange = (next: NoteListFilterValues) => {
    setFilters(next);
    pager.reset();
  };

  return (
    <div className="space-y-4">
      <NoteListFilterBar
        values={filters}
        onChange={handleFilterChange}
        tags={tags}
      />
      {pager.month ? (
        <MonthPaginator
          month={pager.month}
          count={pager.items.length}
          index={pager.index}
          total={pager.months.length}
          onChange={pager.goTo}
        />
      ) : null}
      {pager.items.length > 0 ? (
        <ul className="space-y-3">
          {pager.items.map((note) => (
            <NoteListItem key={note.id} note={note} />
          ))}
        </ul>
      ) : (
        <p className="py-8 text-sm text-zinc-400 text-center">
          {notes.length === 0
            ? "まだ野球ノートが作成されていません。"
            : "条件に一致するノートがありません。"}
        </p>
      )}
    </div>
  );
}
