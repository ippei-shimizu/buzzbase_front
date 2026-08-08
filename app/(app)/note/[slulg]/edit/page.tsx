import type { GameResultLinkOption } from "@app/types/gameResultLink";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseballNote } from "@app/services/v2/baseballNoteService";
import { getGameResultOption } from "@app/services/v2/gameResultLinkService";
import { getImprovementThemes } from "@app/services/v2/improvementThemeService";
import { getNoteTags } from "@app/services/v2/noteTagService";
import { getReflectionTemplates } from "@app/services/v2/reflectionTemplateService";
import NoteEditForm from "./_components/NoteEditForm";

/**
 * 紐付け済みの試合記録を表示用に取得する。
 * 取得できなかった分は落とすだけにして、ノート本体の表示は止めない
 * （紐付け自体は `game_result_ids` に残っており、フォーム側で ID のまま扱える）。
 */
async function fetchLinkedGameResults(
  ids: number[],
): Promise<GameResultLinkOption[]> {
  const results = await Promise.all(ids.map((id) => getGameResultOption(id)));
  return results.flatMap((result) =>
    result.status === "ok" ? [result.data] : [],
  );
}

function NoteLoadError({ message }: { message: string }) {
  return (
    <div className="buzz-dark flex justify-center items-center w-full min-h-screen bg-main">
      <p className="text-sm text-zinc-400 text-center">{message}</p>
    </div>
  );
}

export default async function NoteEditPage(props: {
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
  const [result, templatesResult, tagsResult, themesResult] = await Promise.all(
    [
      getBaseballNote(noteId),
      getReflectionTemplates(),
      getNoteTags(),
      getImprovementThemes(),
    ],
  );
  if (result.status === "forbidden") {
    return <NoteLoadError message="このノートを表示する権限がありません。" />;
  }
  if (result.status === "error") {
    return <NoteLoadError message="野球ノートの読み込みに失敗しました。" />;
  }

  // 紐付け先はノートを取得しないと分からないため、ここだけ直列になる。
  const linkedGameResults = await fetchLinkedGameResults(
    result.data.game_result_ids,
  );

  return (
    <NoteEditForm
      note={result.data}
      templatesResult={templatesResult}
      tagsResult={tagsResult}
      themesResult={themesResult}
      linkedGameResults={linkedGameResults}
    />
  );
}
