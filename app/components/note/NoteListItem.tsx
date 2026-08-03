"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import { Divider } from "@heroui/react";
import Link from "next/link";

interface NoteListItemProps {
  note: BaseballNoteV2;
}

export default function NoteListItem({ note }: NoteListItemProps) {
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
        </div>
        <Divider className="mt-4" />
      </Link>
    </div>
  );
}
