import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { getBaseballNotes } from "@app/services/v2/baseballNoteService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { getPracticeSession } from "@app/services/v2/practiceSessionService";
import {
  DETAIL_FORBIDDEN,
  DETAIL_LOAD_ERROR,
  DETAIL_NOT_FOUND,
} from "../_components/practiceRecordsCopy";
import PracticeSessionDetail from "./_components/PracticeSessionDetail";

export const metadata = {
  title: "練習記録の詳細",
};

function DetailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default async function PracticeSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return (
      <DetailShell>
        <p className="py-8 text-center text-sm text-zinc-400">
          {DETAIL_NOT_FOUND}
        </p>
      </DetailShell>
    );
  }

  // 互いに依存しない取得なので並列で待つ。
  const [sessionResult, notesResult, menusResult] = await Promise.all([
    getPracticeSession(sessionId),
    getBaseballNotes({ practiceSessionId: sessionId }),
    getPracticeMenus(),
  ]);

  if (sessionResult.status !== "ok") {
    const message =
      sessionResult.status === "not_found"
        ? DETAIL_NOT_FOUND
        : sessionResult.status === "forbidden"
          ? DETAIL_FORBIDDEN
          : DETAIL_LOAD_ERROR;
    return (
      <DetailShell>
        <p className="py-8 text-center text-sm text-zinc-400">{message}</p>
      </DetailShell>
    );
  }

  return (
    <DetailShell>
      <PracticeSessionDetail
        session={sessionResult.data}
        menus={menusResult.status === "ok" ? menusResult.data : []}
        notes={notesResult.status === "ok" ? notesResult.data : null}
      />
    </DetailShell>
  );
}
