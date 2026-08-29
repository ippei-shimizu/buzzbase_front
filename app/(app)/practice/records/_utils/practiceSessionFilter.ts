import type { PracticeSession } from "@app/types/practice";
import {
  type RecordSearchValues,
  matchesDateRange,
  matchesKeyword,
  toDay,
} from "@app/utils/recordListFilter";
import { formatPracticeDate } from "./practiceRecordDate";

// back の GET /api/v2/practice_sessions が受け取るのは from / to / improvement_theme_id だけで、
// フリーワード検索もページングも無い。日付レンジも往復のたびに再取得が要るため、
// 一覧は全件を1回で取得してここで絞り込む。

/** セッションの日付（`YYYY-MM-DD`）。月の収集・抽出に渡す。 */
export function practiceSessionDate(session: PracticeSession): string {
  return toDay(session.logged_on);
}

/**
 * フリーワードの検索対象。
 * 日付 / セッションメモ / コンディションメモ / 気分 / 怪我の部位 / メニュー名 を横断する。
 * 日付は `2026-07-14` と `7月14日(火)` の両方を含め、どちらの打ち方でも引けるようにする。
 */
export function practiceSessionSearchParts(session: PracticeSession): string[] {
  const day = practiceSessionDate(session);
  return [
    day,
    formatPracticeDate(day),
    session.memo ?? "",
    session.condition?.memo ?? "",
    session.condition?.mood ?? "",
    ...(session.condition?.injuries ?? []).map((injury) => injury.part),
    ...session.practice_logs.map((log) => log.menu_name),
  ];
}

/**
 * フリーワードと日付レンジで絞り込む。日付レンジは開始日・終了日ともに **その日を含む**。
 * 並び順は back の返却順（練習日の新しい順）を保つ。
 */
export function filterPracticeSessions(
  sessions: PracticeSession[],
  values: RecordSearchValues,
): PracticeSession[] {
  return sessions.filter(
    (session) =>
      matchesKeyword(practiceSessionSearchParts(session), values.keyword) &&
      matchesDateRange(session.logged_on, values),
  );
}
