import type {
  BaseballNoteV2,
  NoteFetchResult,
} from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import type { PracticeMenu, PracticeSession } from "@app/types/practice";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import ListBulletIcon from "@heroicons/react/24/outline/ListBulletIcon";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import Link from "next/link";
import PracticeRecordsBoard from "./PracticeRecordsBoard";
import {
  MANAGE_MENUS_LABEL,
  MENU_SUMMARY_LABEL,
  RECORD_PRACTICE_LABEL,
  SESSIONS_FORBIDDEN,
  SESSIONS_LOAD_ERROR,
} from "./practiceRecordsCopy";

interface PracticeRecordsSectionProps {
  sessionsResult: FetchResult<PracticeSession[]>;
  /** アイコンのカテゴリ判定用。失敗しても一覧自体は出したいので既定アイコンへ倒す。 */
  menusResult: FetchResult<PracticeMenu[]>;
  /** ノート紐付けバッジ用。失敗しても一覧自体は出したいのでバッジだけ落とす。 */
  notesResult: NoteFetchResult<BaseballNoteV2[]>;
}

const HEADER_LINKS = (
  <div className="space-y-2.5">
    <Link
      href="/practice/menus"
      className="flex items-center justify-end gap-1.5 text-[13px] font-semibold text-[#d08000]"
    >
      <ListBulletIcon className="h-4 w-4 shrink-0" aria-hidden />
      {MANAGE_MENUS_LABEL}
      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </Link>
    <Link
      href="/practice/record"
      className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#d08000] py-3.5 text-sm font-bold text-white"
    >
      <PlusIcon className="h-5 w-5 shrink-0" aria-hidden />
      {RECORD_PRACTICE_LABEL}
    </Link>
    <Link
      href="/practice/summary"
      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#d08000] bg-[#d08000]/10 py-2.5 text-[13px] font-bold text-[#d08000]"
    >
      <ChartBarIcon className="h-4 w-4 shrink-0" aria-hidden />
      {MENU_SUMMARY_LABEL}
      <ChevronRightIcon className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  </div>
);

/** 練習記録タブ。導線を出し、取得結果に応じて一覧かエラー文言へ振り分ける。 */
export default function PracticeRecordsSection({
  sessionsResult,
  menusResult,
  notesResult,
}: PracticeRecordsSectionProps) {
  const sessionIdsWithNote =
    notesResult.status === "ok"
      ? notesResult.data
          .map((note) => note.practice_session_id)
          .filter((id): id is number => id !== null)
      : [];

  return (
    <div className="space-y-4">
      {HEADER_LINKS}
      {sessionsResult.status === "ok" ? (
        <PracticeRecordsBoard
          sessions={sessionsResult.data}
          menus={menusResult.status === "ok" ? menusResult.data : []}
          sessionIdsWithNote={sessionIdsWithNote}
        />
      ) : (
        // 取得失敗を空配列に丸めると「記録が0件」と誤表示してしまう。
        <p className="py-8 text-center text-sm text-zinc-400">
          {sessionsResult.status === "forbidden"
            ? SESSIONS_FORBIDDEN
            : SESSIONS_LOAD_ERROR}
        </p>
      )}
    </div>
  );
}
