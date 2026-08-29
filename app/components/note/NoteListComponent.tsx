"use client";

import type {
  BaseballNoteV2,
  NoteFetchResult,
  NoteTag,
} from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import NoteListBoard from "@app/components/note/NoteListBoard";

interface NoteListComponentProps {
  result: NoteFetchResult<BaseballNoteV2[]>;
  /** タグチップの候補。取得に失敗しても一覧自体は出したいのでチップだけ落とす。 */
  tagsResult: FetchResult<NoteTag[]>;
}

export default function NoteListComponent({
  result,
  tagsResult,
}: NoteListComponentProps) {
  if (result.status === "forbidden") {
    return (
      <p className="text-sm text-zinc-400 text-center">
        野球ノートを表示する権限がありません。
      </p>
    );
  }
  if (result.status === "error") {
    return (
      <p className="text-sm text-zinc-400 text-center">
        野球ノートの読み込みに失敗しました。
      </p>
    );
  }

  return (
    <NoteListBoard
      notes={result.data}
      tags={tagsResult.status === "ok" ? tagsResult.data : []}
    />
  );
}
