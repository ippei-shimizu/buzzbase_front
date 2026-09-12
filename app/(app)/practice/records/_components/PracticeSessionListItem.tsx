import type { PracticeCategory, PracticeSession } from "@app/types/practice";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import Link from "next/link";
import {
  conditionLevelMeta,
  formatPracticeValue,
  practiceIconForLog,
} from "@app/constants/practice";
import {
  practiceDayOfMonth,
  practiceWeekday,
} from "../_utils/practiceRecordDate";
import {
  MENUS_EMPTY_LOG_MESSAGE,
  NOTE_BADGE_LABEL,
} from "./practiceRecordsCopy";

interface PracticeSessionListItemProps {
  session: PracticeSession;
  /** この日の記録に野球ノートが紐付いているか。 */
  hasNote: boolean;
  /** メニュー ID => カテゴリ。アイコンの出し分けに使う（削除済みメニューは未登録）。 */
  categoryById: Map<number, PracticeCategory>;
}

/** 一覧1行。左に日付、右にその日のメニューとコンディションの要約を出す。 */
export default function PracticeSessionListItem({
  session,
  hasNote,
  categoryById,
}: PracticeSessionListItemProps) {
  // 体調を優先して1つだけ顔アイコンにする。両方出すと一覧が読みづらくなる。
  const levelMeta = conditionLevelMeta(
    session.condition?.physical_level ?? session.condition?.fatigue_level,
  );
  const LevelIcon = levelMeta?.icon;

  return (
    <li className="flex gap-2">
      <div className="w-10 shrink-0 pt-1 text-center">
        <p className="text-xl font-extrabold text-white">
          {practiceDayOfMonth(session.logged_on)}
        </p>
        <p className="-mt-0.5 text-[11px] font-bold text-zinc-400">
          {practiceWeekday(session.logged_on)}
        </p>
      </div>
      <Link
        href={`/practice/records/${session.id}`}
        className="flex-1 rounded-xl bg-sub p-3 transition-colors hover:bg-[#4d4d4d]"
      >
        {session.practice_logs.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {session.practice_logs.map((log) => {
              const MenuIcon = practiceIconForLog(
                log.source,
                log.practice_menu_id === null
                  ? undefined
                  : categoryById.get(log.practice_menu_id),
              );
              const value = formatPracticeValue(log);
              return (
                <span
                  key={log.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-main px-2 py-1.5"
                >
                  <MenuIcon
                    className="h-3.5 w-3.5 shrink-0 text-[#d08000]"
                    aria-hidden
                  />
                  <span className="text-[13px] font-bold text-white">
                    {log.menu_name}
                  </span>
                  {value ? (
                    <span className="text-[13px] font-extrabold text-[#d08000]">
                      {value}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-zinc-400">{MENUS_EMPTY_LOG_MESSAGE}</p>
        )}
        {levelMeta || hasNote ? (
          <div className="mt-2 flex items-center gap-2.5">
            {levelMeta && LevelIcon ? (
              <LevelIcon
                className={`h-4 w-4 shrink-0 ${levelMeta.colorClass}`}
                aria-hidden
              />
            ) : null}
            {hasNote ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#d08000]">
                <DocumentTextIcon
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />
                {NOTE_BADGE_LABEL}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>
    </li>
  );
}
