"use client";

import type { NoteMediaAttachment } from "@app/interface/mediaAttachmentV2";
import { useRouter } from "next/navigation";
import MediaAttachmentList from "./MediaAttachmentList";
import { SECTION_HEADING } from "./mediaCopy";
import MediaPicker from "./MediaPicker";

interface NoteMediaSectionProps {
  noteId: number;
  attachments: NoteMediaAttachment[];
}

/**
 * 保存済みノートの添付セクション。
 * 追加・削除・メモ更新はいずれも Server Action 経由で、成功後に
 * `router.refresh()` でサーバー側の一覧を引き直す（クライアントに写しを持たない）。
 */
export default function NoteMediaSection({
  noteId,
  attachments,
}: NoteMediaSectionProps) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <section aria-labelledby="note-media-heading" className="mt-8">
      <h3
        id="note-media-heading"
        className="mb-2 text-sm font-bold text-zinc-400"
      >
        {SECTION_HEADING}
      </h3>
      <MediaPicker baseballNoteId={noteId} onUploaded={refresh} />
      <MediaAttachmentList
        attachments={attachments}
        noteId={noteId}
        editable
        onChanged={refresh}
      />
    </section>
  );
}
