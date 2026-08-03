import type {
  BaseballNoteV2,
  NoteFetchResult,
} from "@app/interface/baseballNoteV2";
import { Card } from "@heroui/react";
import NoteListItem from "@app/components/note/NoteListItem";

interface NoteListComponentProps {
  result: NoteFetchResult<BaseballNoteV2[]>;
}

export default function NoteListComponent({ result }: NoteListComponentProps) {
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
    <div>
      <Card className="pt-2 pb-8 px-6">
        {result.data.length > 0 ? (
          result.data.map((note) => <NoteListItem key={note.id} note={note} />)
        ) : (
          <p className="text-sm text-zinc-400 text-center">
            まだ野球ノートが作成されていません。
          </p>
        )}
      </Card>
    </div>
  );
}
