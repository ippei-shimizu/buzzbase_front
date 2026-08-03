import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NoteCreateForm from "./_components/NoteCreateForm";

export default async function NoteNew() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }
  return <NoteCreateForm />;
}
