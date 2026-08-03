import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getNoteTags } from "@app/services/v2/noteTagService";
import { getReflectionTemplates } from "@app/services/v2/reflectionTemplateService";
import NoteCreateForm from "./_components/NoteCreateForm";

export default async function NoteNew() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }
  // 互いに依存しない取得なので並列で待つ。
  const [templatesResult, tagsResult] = await Promise.all([
    getReflectionTemplates(),
    getNoteTags(),
  ]);
  return (
    <NoteCreateForm templatesResult={templatesResult} tagsResult={tagsResult} />
  );
}
