import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseballNote } from "@app/services/v2/baseballNoteService";
import { getNoteTags } from "@app/services/v2/noteTagService";
import { getReflectionTemplates } from "@app/services/v2/reflectionTemplateService";
import NoteEditForm from "./_components/NoteEditForm";

function NoteLoadError({ message }: { message: string }) {
  return (
    <div className="buzz-dark flex justify-center items-center w-full min-h-screen bg-main">
      <p className="text-sm text-zinc-400 text-center">{message}</p>
    </div>
  );
}

export default async function NoteDetail(props: {
  params: Promise<{ slulg: string }>;
}) {
  const { slulg } = await props.params;
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const noteId = Number(slulg);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return <NoteLoadError message="野球ノートが見つかりません。" />;
  }

  // 互いに依存しない取得なので並列で待つ。
  const [result, templatesResult, tagsResult] = await Promise.all([
    getBaseballNote(noteId),
    getReflectionTemplates(),
    getNoteTags(),
  ]);
  if (result.status === "forbidden") {
    return <NoteLoadError message="このノートを表示する権限がありません。" />;
  }
  if (result.status === "error") {
    return <NoteLoadError message="野球ノートの読み込みに失敗しました。" />;
  }

  return (
    <NoteEditForm
      note={result.data}
      templatesResult={templatesResult}
      tagsResult={tagsResult}
    />
  );
}
