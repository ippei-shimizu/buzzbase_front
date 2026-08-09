import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import NoteAddButton from "@app/components/button/NoteAddButton";
import Header from "@app/components/header/Header";
import NoteListComponent from "@app/components/note/NoteListComponent";
import { getBaseballNotes } from "@app/services/v2/baseballNoteService";
import { getNoteTags } from "@app/services/v2/noteTagService";

export default async function NoteList() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }
  // 互いに依存しない取得なので並列で待つ。
  const [result, tagsResult] = await Promise.all([
    getBaseballNotes(),
    getNoteTags(),
  ]);
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <Header />
        <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
            <div className="pt-20 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">野球ノート</h2>
                <Link
                  href="/note/templates"
                  className="text-sm font-semibold text-[#d08000]"
                >
                  振り返りテンプレを管理
                </Link>
              </div>
              <div className="my-6">
                <NoteListComponent result={result} tagsResult={tagsResult} />
              </div>
              <AdInFeed
                slot={adSlots.noteListInFeed}
                layoutKey="-6t+ed+2i-1n-4w"
              />
              <NoteAddButton />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
