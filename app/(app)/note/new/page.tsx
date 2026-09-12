import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getImprovementThemes } from "@app/services/v2/improvementThemeService";
import { getNoteTags } from "@app/services/v2/noteTagService";
import { getReflectionTemplates } from "@app/services/v2/reflectionTemplateService";
import NoteCreateForm from "./_components/NoteCreateForm";

/** 課題詳細からの導線（`?improvement_theme_id=`）を紐付け済みの課題として受け取る。 */
function initialThemeIds(value: string | string[] | undefined): number[] {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? [id] : [];
}

export default async function NoteNew(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }
  const searchParams = await props.searchParams;
  // 互いに依存しない取得なので並列で待つ。
  const [templatesResult, tagsResult, themesResult] = await Promise.all([
    getReflectionTemplates(),
    getNoteTags(),
    getImprovementThemes(),
  ]);
  return (
    <NoteCreateForm
      templatesResult={templatesResult}
      tagsResult={tagsResult}
      themesResult={themesResult}
      initialThemeIds={initialThemeIds(searchParams.improvement_theme_id)}
    />
  );
}
