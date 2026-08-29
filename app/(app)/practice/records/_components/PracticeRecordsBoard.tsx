"use client";

import type { PracticeMenu, PracticeSession } from "@app/types/practice";
import type { RecordSearchValues } from "@app/utils/recordListFilter";
import { useState } from "react";
import MonthPaginator from "@app/components/filter/MonthPaginator";
import RecordSearchFilterBar from "@app/components/filter/RecordSearchFilterBar";
import { useMonthPager } from "@app/hooks/records/useMonthPager";
import {
  EMPTY_RECORD_SEARCH,
  formatMonthLabel,
  groupByMonth,
  hasActiveRecordSearch,
} from "@app/utils/recordListFilter";
import {
  filterPracticeSessions,
  practiceSessionDate,
} from "../_utils/practiceSessionFilter";
import {
  SEARCH_LABEL,
  SEARCH_PLACEHOLDER,
  SESSIONS_EMPTY_MESSAGE,
  SESSIONS_NO_MATCH_MESSAGE,
} from "./practiceRecordsCopy";
import PracticeSessionListItem from "./PracticeSessionListItem";

interface PracticeRecordsBoardProps {
  sessions: PracticeSession[];
  /** アイコンのカテゴリ判定に使う。取得に失敗した場合は空配列で既定アイコンに倒す。 */
  menus: PracticeMenu[];
  /** 野球ノートが紐付いているセッションの ID。取得に失敗した場合は空配列。 */
  sessionIdsWithNote: number[];
}

/**
 * 練習記録一覧の Container。
 * 絞り込み状態と月ページを保持し、未絞り込みなら1ヶ月ずつ、絞り込み中は全期間を
 * 月見出し付きで表示する。back に検索・ページングの API が無いため計算はすべてここで行う。
 */
export default function PracticeRecordsBoard({
  sessions,
  menus,
  sessionIdsWithNote,
}: PracticeRecordsBoardProps) {
  const [filters, setFilters] = useState<RecordSearchValues>(
    () => EMPTY_RECORD_SEARCH,
  );

  const categoryById = new Map(menus.map((menu) => [menu.id, menu.category]));
  const noteSessionIds = new Set(sessionIdsWithNote);

  const isFiltered = hasActiveRecordSearch(filters);
  const filtered = filterPracticeSessions(sessions, filters);
  const monthGroups = groupByMonth(filtered, practiceSessionDate);
  const pager = useMonthPager(sessions, practiceSessionDate);

  // 絞り込みを変えたら必ず最新の月へ戻す。古いページ番号のまま絞り込みを解除すると
  // 該当する記録があるのに「結果なし」に見えてしまう。
  const handleFilterChange = (next: RecordSearchValues) => {
    setFilters(next);
    pager.reset();
  };

  const renderItem = (session: PracticeSession) => (
    <PracticeSessionListItem
      key={session.id}
      session={session}
      hasNote={noteSessionIds.has(session.id)}
      categoryById={categoryById}
    />
  );

  const visibleCount = isFiltered ? filtered.length : pager.items.length;

  return (
    <div className="space-y-4">
      <RecordSearchFilterBar
        values={filters}
        onChange={handleFilterChange}
        onClear={() => handleFilterChange({ ...EMPTY_RECORD_SEARCH })}
        showClear={isFiltered}
        searchLabel={SEARCH_LABEL}
        searchPlaceholder={SEARCH_PLACEHOLDER}
      />
      {isFiltered ? (
        <div className="space-y-5">
          {monthGroups.map((group) => (
            <section key={group.month}>
              <h3 className="mb-2 text-[13px] font-bold text-zinc-400">
                {formatMonthLabel(group.month)}
              </h3>
              <ul className="space-y-3.5">{group.items.map(renderItem)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <>
          {pager.month ? (
            <MonthPaginator
              month={pager.month}
              count={pager.items.length}
              index={pager.index}
              total={pager.months.length}
              onChange={pager.goTo}
            />
          ) : null}
          <ul className="space-y-3.5">{pager.items.map(renderItem)}</ul>
        </>
      )}
      {visibleCount === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">
          {sessions.length === 0
            ? SESSIONS_EMPTY_MESSAGE
            : SESSIONS_NO_MATCH_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}
