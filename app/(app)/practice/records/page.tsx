import type { RecordsTab } from "./_components/RecordsTabBar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import NoteListComponent from "@app/components/note/NoteListComponent";
import { getBaseballNotes } from "@app/services/v2/baseballNoteService";
import { getNoteTags } from "@app/services/v2/noteTagService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { getPracticeSessions } from "@app/services/v2/practiceSessionService";
import PracticeRecordsSection from "./_components/PracticeRecordsSection";
import RecordsTabBar from "./_components/RecordsTabBar";

export const metadata = {
  title: "練習記録",
};

interface PracticeRecordsSearchParams {
  /** `note` で野球ノートタブ。未指定・不正値は練習記録タブ。 */
  tab?: string;
}

export default async function PracticeRecordsPage({
  searchParams,
}: {
  searchParams: Promise<PracticeRecordsSearchParams>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { tab } = await searchParams;
  const activeTab: RecordsTab = tab === "note" ? "note" : "practice";

  // 互いに依存しない取得なので並列で待つ。表示しないタブのデータは取りに行かない
  // （ノートは練習記録タブでも紐付けバッジに使うため常に取る）。
  const isNoteTab = activeTab === "note";
  const [sessionsResult, menusResult, notesResult, tagsResult] =
    await Promise.all([
      isNoteTab ? null : getPracticeSessions(),
      isNoteTab ? null : getPracticeMenus(),
      getBaseballNotes(),
      isNoteTab ? getNoteTags() : null,
    ]);

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-12 px-4 lg:px-6">
            <RecordsTabBar active={activeTab} />
            <div className="my-6">
              {sessionsResult && menusResult ? (
                <PracticeRecordsSection
                  sessionsResult={sessionsResult}
                  menusResult={menusResult}
                  notesResult={notesResult}
                />
              ) : (
                <NoteListComponent
                  result={notesResult}
                  tagsResult={tagsResult ?? { status: "error" }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
