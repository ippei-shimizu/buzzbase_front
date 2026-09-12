import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBackTo from "@app/components/header/HeaderBackTo";
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

/**
 * 詳細のガワ。ヘッダーは呼び出し元が渡す。
 * 正常系は本文側（PracticeSessionDetail）が編集・削除つきヘッダーを自分で描くため、
 * ここでは戻る動線だけのヘッダーを渡せるようにしている。
 */
function DetailShell({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      {header}
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-[74px] px-4 lg:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

const FALLBACK_HEADER = (
  <HeaderBackTo href="/practice/records" label="練習記録一覧に戻る" />
);

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
      <DetailShell header={FALLBACK_HEADER}>
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
      <DetailShell header={FALLBACK_HEADER}>
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
