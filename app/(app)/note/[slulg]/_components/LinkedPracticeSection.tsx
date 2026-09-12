import type { PracticeCategory, PracticeSession } from "@app/types/practice";
import ClipboardDocumentListIcon from "@heroicons/react/24/outline/ClipboardDocumentListIcon";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import Link from "next/link";
import {
  formatPracticeValue,
  practiceIconForLog,
} from "@app/constants/practice";
import { formatPracticeDate } from "../../../practice/records/_utils/practiceRecordDate";

const SECTION_TITLE = "紐付けた練習";
const EDIT_LABEL = "編集";
const MENUS_EMPTY_MESSAGE = "メニューの記録はありません";

interface LinkedPracticeSectionProps {
  session: PracticeSession;
  /** アイコンのカテゴリ判定用。取得に失敗した場合は空の Map で既定アイコンに倒す。 */
  categoryById: Map<number, PracticeCategory>;
}

/** ノートに紐付いた練習記録の要約（Presentational）。 */
export default function LinkedPracticeSection({
  session,
  categoryById,
}: LinkedPracticeSectionProps) {
  const logs = session.practice_logs;

  return (
    <section aria-labelledby="note-detail-practice-heading" className="mt-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d08000]">
            <ClipboardDocumentListIcon
              className="h-5 w-5 text-white"
              aria-hidden
            />
          </span>
          <div>
            <h3
              id="note-detail-practice-heading"
              className="text-sm font-bold text-zinc-400"
            >
              {SECTION_TITLE}
            </h3>
            <p className="text-sm font-bold text-white">
              {formatPracticeDate(session.logged_on)}
            </p>
          </div>
        </div>
        <Link
          href={`/practice/record?date=${session.logged_on}`}
          className="mt-1 inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#d08000]"
        >
          <PencilSquareIcon className="h-4 w-4 shrink-0" aria-hidden />
          {EDIT_LABEL}
        </Link>
      </div>

      {logs.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">{MENUS_EMPTY_MESSAGE}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {logs.map((log) => {
            const Icon = practiceIconForLog(
              log.source,
              log.practice_menu_id === null
                ? undefined
                : categoryById.get(log.practice_menu_id),
            );
            const value = formatPracticeValue(log);
            return (
              <li
                key={log.id}
                className="flex items-center gap-2 rounded-lg bg-sub px-3 py-2.5"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#d08000]" aria-hidden />
                <p className="flex-1 text-sm font-bold text-white">
                  {log.menu_name}
                </p>
                {value ? (
                  <p className="text-sm font-extrabold text-[#d08000]">
                    {value}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
