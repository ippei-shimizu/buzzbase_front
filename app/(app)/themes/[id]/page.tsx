import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeaderBackTo from "@app/components/header/HeaderBackTo";
import { getBaseballNotes } from "@app/services/v2/baseballNoteService";
import { getImprovementThemes } from "@app/services/v2/improvementThemeService";
import { getPracticeSessions } from "@app/services/v2/practiceSessionService";
import { todayString } from "@app/utils/formatDate";
import {
  LOAD_ERROR_MESSAGE,
  NOT_FOUND_MESSAGE,
} from "../_components/themeCopy";
import ThemeDetailContent from "./_components/ThemeDetailContent";

export const metadata = {
  title: "課題の詳細",
};

function ThemeDetailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBackTo href="/themes" label="課題一覧に戻る" />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default async function ThemeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const { id } = await props.params;
  const themeId = Number(id);
  if (!Number.isInteger(themeId) || themeId <= 0) {
    return (
      <ThemeDetailShell>
        <p className="py-8 text-center text-sm text-zinc-400">
          {NOT_FOUND_MESSAGE}
        </p>
      </ThemeDetailShell>
    );
  }

  // back に課題の show エンドポイントは無いため、一覧から該当の1件を取り出す。
  // 紐づく記録の取得は課題の取得結果に依存しないので並列で待つ。
  const [themesResult, sessionsResult, notesResult] = await Promise.all([
    getImprovementThemes(),
    getPracticeSessions({ improvement_theme_id: themeId }),
    getBaseballNotes({ improvementThemeId: themeId }),
  ]);

  if (themesResult.status !== "ok") {
    return (
      <ThemeDetailShell>
        <p className="py-8 text-center text-sm text-zinc-400">
          {LOAD_ERROR_MESSAGE}
        </p>
      </ThemeDetailShell>
    );
  }

  const theme = themesResult.data.find((item) => item.id === themeId) ?? null;
  if (!theme) {
    return (
      <ThemeDetailShell>
        <p className="py-8 text-center text-sm text-zinc-400">
          {NOT_FOUND_MESSAGE}
        </p>
      </ThemeDetailShell>
    );
  }

  return (
    <ThemeDetailShell>
      <ThemeDetailContent
        theme={theme}
        sessions={sessionsResult.status === "ok" ? sessionsResult.data : []}
        sessionsLoadFailed={sessionsResult.status !== "ok"}
        notes={notesResult.status === "ok" ? notesResult.data : []}
        notesLoadFailed={notesResult.status !== "ok"}
        today={todayString()}
      />
    </ThemeDetailShell>
  );
}
