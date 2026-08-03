"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import { Divider } from "@heroui/react";
import Link from "next/link";
import { tagLabel } from "@app/utils/noteTags";

interface NoteListItemProps {
  note: BaseballNoteV2;
}

/** ノートが何に紐付いているかを一覧から分かるようにするチップの文言。 */
function linkLabels(note: BaseballNoteV2): string[] {
  const labels: string[] = [];
  if (note.game_result_ids.length > 0)
    labels.push(`試合 ${note.game_result_ids.length}件`);
  if (note.improvement_theme_ids.length > 0)
    labels.push(`課題 ${note.improvement_theme_ids.length}件`);
  if (note.practice_session_id !== null) labels.push("練習記録");
  if (note.practice_log_id !== null) labels.push("練習");
  if (note.media_attachments.length > 0)
    labels.push(`メディア ${note.media_attachments.length}件`);
  return labels;
}

export default function NoteListItem({ note }: NoteListItemProps) {
  const links = linkLabels(note);

  return (
    <div>
      <Link href={`/note/${note.id}`} className="block pt-4">
        <div>
          <p className="text-base font-bold truncate">
            {note.title ? note.title : "無題のノート"}
          </p>
          <div className="flex gap-x-2 mt-0.5">
            <p className="text-sm text-zinc-400 whitespace-nowrap">
              {new Date(note.date).toLocaleDateString()}
            </p>
            {/* memo は Slate JSON 文字列のため、back が抽出したプレビューを表示する。 */}
            <p className="text-sm text-zinc-400 truncate">
              {note.memo_preview}
            </p>
          </div>
          {note.tags.length > 0 || links.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-[#d08000]/15 px-2 py-0.5 text-[11px] font-bold text-[#d08000]"
                >
                  {tagLabel(tag.name)}
                </span>
              ))}
              {links.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-sub px-2 py-0.5 text-[11px] font-bold text-zinc-400"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <Divider className="mt-4" />
      </Link>
    </div>
  );
}
