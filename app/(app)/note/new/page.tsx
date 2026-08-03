import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getReflectionTemplates } from "@app/services/v2/reflectionTemplateService";
import NoteCreateForm from "./_components/NoteCreateForm";

export default async function NoteNew() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }
  const templatesResult = await getReflectionTemplates();
  return <NoteCreateForm templatesResult={templatesResult} />;
}
