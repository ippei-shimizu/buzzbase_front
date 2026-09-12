"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import Link from "next/link";
import { tagLabel } from "@app/utils/noteTags";

interface NoteListItemProps {
  note: BaseballNoteV2;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/** "YYYY-MM-DD" をタイムゾーンに左右されないローカル日付として組み立てる（mobile の parseDate と同じ挙動）。 */
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** 練習・試合への紐付けは色付きチップ、件数系（課題・メディア）は無彩色チップで区別する。 */
function countLabels(note: BaseballNoteV2): string[] {
  const labels: string[] = [];
  if (note.improvement_theme_ids.length > 0)
    labels.push(`課題 ${note.improvement_theme_ids.length}件`);
  if (note.media_attachments.length > 0)
    labels.push(`メディア ${note.media_attachments.length}件`);
  return labels;
}

export default function NoteListItem({ note }: NoteListItemProps) {
  const date = parseIsoDate(note.date);
  const hasPractice =
    note.practice_session_id !== null || note.practice_log_id !== null;
  const hasGame = note.game_result_ids.length > 0;
  const counts = countLabels(note);

  return (
    <li className="flex gap-2">
      <div className="w-10 shrink-0 pt-1 text-center">
        <p className="text-xl font-extrabold leading-none text-white">
          {date.getDate()}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-zinc-400">
          {WEEKDAY_LABELS[date.getDay()]}
        </p>
      </div>
      <Link href={`/note/${note.id}`} className="flex-1 rounded-xl bg-sub p-3">
        <p className="text-base font-bold truncate">
          {note.title ? note.title : "無題のノート"}
        </p>
        {note.memo_preview ? (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
            {note.memo_preview}
          </p>
        ) : null}
        {hasPractice || hasGame ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {hasPractice ? (
              <span className="rounded-full bg-[#d08000]/15 px-2.5 py-1 text-[11px] font-bold text-[#d08000]">
                練習に紐付け
              </span>
            ) : null}
            {hasGame ? (
              <span className="rounded-full bg-[#3b82f6]/15 px-2.5 py-1 text-[11px] font-bold text-[#93c5fd]">
                試合に紐付け
              </span>
            ) : null}
          </div>
        ) : null}
        {note.tags.length > 0 || counts.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-main px-2.5 py-1 text-[11px] font-bold text-zinc-300"
              >
                {tagLabel(tag.name)}
              </span>
            ))}
            {counts.map((label) => (
              <span
                key={label}
                className="rounded-full bg-main px-2.5 py-1 text-[11px] font-bold text-zinc-400"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
    </li>
  );
}
