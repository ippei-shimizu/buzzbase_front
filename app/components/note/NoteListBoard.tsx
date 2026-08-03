"use client";

import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { NoteListFilterValues } from "@app/utils/noteListFilter";
import { Card } from "@heroui/react";
import { useState } from "react";
import NoteListFilterBar from "@app/components/note/NoteListFilterBar";
import NoteListItem from "@app/components/note/NoteListItem";
import {
  EMPTY_NOTE_FILTERS,
  collectNoteMonths,
  filterNotes,
  formatMonthLabel,
  notesInMonth,
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
  const [monthIndex, setMonthIndex] = useState(0);

  const filtered = filterNotes(notes, filters);
  const months = collectNoteMonths(filtered);
  // 絞り込みで月の並びが短くなっても範囲外を指さないよう、描画時に丸める。
  const currentIndex = Math.min(monthIndex, Math.max(months.length - 1, 0));
  const currentMonth = months[currentIndex];
  const visibleNotes = currentMonth ? notesInMonth(filtered, currentMonth) : [];

  // 絞り込みを変えたら必ず最新の月へ戻す。古いページ番号のまま検索すると
  // 該当ノートがあるのに「結果なし」に見えてしまう。
  const handleFilterChange = (next: NoteListFilterValues) => {
    setFilters(next);
    setMonthIndex(0);
  };

  return (
    <div className="space-y-4">
      <NoteListFilterBar
        values={filters}
        onChange={handleFilterChange}
        tags={tags}
      />
      {months.length > 0 ? (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonthIndex(currentIndex + 1)}
            disabled={currentIndex >= months.length - 1}
            className="px-2 py-1.5 text-xs font-bold text-zinc-400 disabled:opacity-40"
          >
            前の月
          </button>
          <p className="text-sm font-bold" aria-live="polite">
            {formatMonthLabel(currentMonth)}（{visibleNotes.length}件）
          </p>
          <button
            type="button"
            onClick={() => setMonthIndex(currentIndex - 1)}
            disabled={currentIndex <= 0}
            className="px-2 py-1.5 text-xs font-bold text-zinc-400 disabled:opacity-40"
          >
            次の月
          </button>
        </div>
      ) : null}
      <Card className="pt-2 pb-8 px-6">
        {visibleNotes.length > 0 ? (
          visibleNotes.map((note) => <NoteListItem key={note.id} note={note} />)
        ) : (
          <p className="text-sm text-zinc-400 text-center">
            {notes.length === 0
              ? "まだ野球ノートが作成されていません。"
              : "条件に一致するノートがありません。"}
          </p>
        )}
      </Card>
    </div>
  );
}
