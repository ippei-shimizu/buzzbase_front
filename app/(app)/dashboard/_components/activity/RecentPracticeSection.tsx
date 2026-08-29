import type {
  BaseballNoteV2,
  NoteFetchResult,
} from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import type {
  ConditionLog,
  PracticeLog,
  PracticeMenu,
  PracticeSession,
} from "@app/types/practice";
import type { ComponentType, SVGProps } from "react";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import HeartIcon from "@heroicons/react/24/outline/HeartIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import Link from "next/link";
import {
  type ConditionLevelKind,
  conditionLevelLabel,
  conditionLevelMeta,
  formatPracticeValue,
  practiceIconForLog,
} from "@app/constants/practice";
import { recentPracticeDateLabel } from "../../_utils/recentPracticeDate";
import {
  RECENT_PRACTICE_EMPTY,
  RECENT_PRACTICE_LOAD_ERROR,
  RECENT_PRACTICE_MORE_LABEL,
  RECENT_PRACTICE_NO_MENU,
  RECENT_PRACTICE_TITLE,
  recentPracticeDetailLabel,
} from "./activityCopy";
import SectionCard, { SectionEmpty, SectionError } from "./SectionCard";

interface RecentPracticeSectionProps {
  sessionsResult: FetchResult<PracticeSession[]>;
  /** 練習ログに紐付いたノートのプレビュー用。失敗してもプレビューだけ落として一覧は出す。 */
  notesResult: NoteFetchResult<BaseballNoteV2[]>;
  /** メニューアイコンのカテゴリ判定用。失敗しても既定アイコンへ倒す。 */
  menusResult: FetchResult<PracticeMenu[]>;
  /** Asia/Tokyo の今日（`YYYY-MM-DD`）。「今日 / 昨日 / 一昨日」の基準。 */
  today: string;
}

/** タイムラインに出す日数。直近の数日だけを出して面のスクロール量を抑える。 */
const RECENT_DAYS = 5;

const BADGE_CLASS =
  "inline-flex shrink-0 items-center gap-1 rounded-[10px] bg-main px-2 py-0.5 text-[11px] font-bold";

/**
 * その日のコンディションを1つのバッジに要約する。
 * 体調 → 疲労度 → 気分 の優先で1指標だけ出す（mobile と同じ優先順）。
 * 2つ並べるとタイムラインが読みにくくなるため、詳細は日別の詳細画面に任せる。
 */
function ConditionBadge({ condition }: { condition: ConditionLog | null }) {
  if (!condition) return null;

  const kind: ConditionLevelKind =
    condition.physical_level != null ? "physical" : "fatigue";
  const level = condition.physical_level ?? condition.fatigue_level;
  const meta = conditionLevelMeta(level);

  if (meta) {
    const LevelIcon = meta.icon;
    return (
      <span className={`${BADGE_CLASS} ${meta.colorClass}`}>
        <LevelIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {conditionLevelLabel(kind, level)}
      </span>
    );
  }

  if (condition.mood) {
    return (
      <span className={`${BADGE_CLASS} text-[#d08000]`}>
        <HeartIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {condition.mood}
      </span>
    );
  }

  return null;
}

interface PracticeLogRowProps {
  log: PracticeLog;
  /** メニュー種別のアイコン。呼び出し側で解決して渡す。 */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** この練習ログに紐付いた野球ノートのプレビュー。無ければ undefined。 */
  notePreview: string | undefined;
}

/** 1メニュー分の行。メニュー名・量と、紐付いたノートのプレビューを出す。 */
function PracticeLogRow({
  log,
  icon: MenuIcon,
  notePreview,
}: PracticeLogRowProps) {
  // back の decimal は "200.0" のような文字列で返るため、整形を通してから出す。
  const value = formatPracticeValue(log);

  return (
    <li className="py-0.5">
      <span className="flex items-center gap-2">
        <MenuIcon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        <span className="min-w-0 truncate text-sm text-white">
          {log.menu_name}
        </span>
        {value ? (
          <span className="shrink-0 text-[13px] font-bold text-zinc-300">
            {value}
          </span>
        ) : null}
      </span>
      {notePreview ? (
        <span className="mt-0.5 flex items-start gap-1 pl-6">
          <PencilIcon className="mt-0.5 h-3 w-3 shrink-0 text-zinc-500" />
          <span className="line-clamp-2 text-xs leading-4 text-zinc-400">
            {notePreview}
          </span>
        </span>
      ) : null}
    </li>
  );
}

/**
 * 最近の練習タイムライン（直近5日）。
 * 日付・コンディション・やったメニュー・紐付けノートを1行にまとめ、
 * その日の練習記録詳細へ遷移できるようにする。
 */
export default function RecentPracticeSection({
  sessionsResult,
  notesResult,
  menusResult,
  today,
}: RecentPracticeSectionProps) {
  if (sessionsResult.status !== "ok") {
    return (
      <SectionCard title={RECENT_PRACTICE_TITLE}>
        <SectionError message={RECENT_PRACTICE_LOAD_ERROR} />
      </SectionCard>
    );
  }

  const recent = sessionsResult.data.slice(0, RECENT_DAYS);
  const categoryById = new Map(
    menusResult.status === "ok"
      ? menusResult.data.map((menu) => [menu.id, menu.category] as const)
      : [],
  );
  const previewByLogId = new Map(
    notesResult.status === "ok"
      ? notesResult.data
          .filter((note) => note.practice_log_id !== null)
          .map((note) => [note.practice_log_id, note.memo_preview] as const)
      : [],
  );

  return (
    <SectionCard title={RECENT_PRACTICE_TITLE}>
      {recent.length === 0 ? (
        <SectionEmpty message={RECENT_PRACTICE_EMPTY} />
      ) : (
        <ul className="divide-y divide-zinc-700">
          {recent.map((session) => {
            const { main, weekday } = recentPracticeDateLabel(
              session.logged_on,
              today,
            );
            return (
              <li key={session.id}>
                <Link
                  href={`/practice/records/${session.id}`}
                  aria-label={recentPracticeDetailLabel(main)}
                  className="block py-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex flex-1 items-baseline gap-1">
                      <span className="text-sm font-bold text-white">
                        {main}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500">
                        ({weekday})
                      </span>
                    </span>
                    <ConditionBadge condition={session.condition} />
                    <ChevronRightIcon
                      className="h-4 w-4 shrink-0 text-zinc-500"
                      aria-hidden
                    />
                  </span>
                  {session.practice_logs.length === 0 ? (
                    <span className="mt-1.5 block text-[13px] text-zinc-400">
                      {RECENT_PRACTICE_NO_MENU}
                    </span>
                  ) : (
                    <ul className="mt-1.5">
                      {session.practice_logs.map((log) => (
                        <PracticeLogRow
                          key={log.id}
                          log={log}
                          icon={practiceIconForLog(
                            log.source,
                            log.practice_menu_id === null
                              ? undefined
                              : categoryById.get(log.practice_menu_id),
                          )}
                          notePreview={previewByLogId.get(log.id)}
                        />
                      ))}
                    </ul>
                  )}
                  {session.memo ? (
                    <span className="mt-1.5 line-clamp-2 block text-xs leading-4 text-zinc-400">
                      {session.memo}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {recent.length > 0 ? (
        <Link
          href="/practice/records"
          className="mt-3 flex items-center justify-center gap-1 text-[13px] font-semibold text-[#d08000]"
        >
          {RECENT_PRACTICE_MORE_LABEL}
          <ChevronRightIcon className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      ) : null}
    </SectionCard>
  );
}
