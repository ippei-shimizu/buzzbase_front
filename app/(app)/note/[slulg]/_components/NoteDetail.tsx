"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import type { GameResultLinkOption } from "@app/types/gameResultLink";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import type { PracticeMenu, PracticeSession } from "@app/types/practice";
import { FlagIcon } from "@heroicons/react/24/outline";
import HeaderNoteDetail from "@app/components/header/HeaderNoteDetail";
import { BallIcon } from "@app/components/icon/BallIcon";
import MediaAttachmentList from "@app/components/note/media/MediaAttachmentList";
import { themeCategoryLabel } from "@app/constants/improvementTheme";
import { formatJaFullDate } from "@app/utils/formatDate";
import { extractMemoText, isReflectionMemo } from "@app/utils/noteMemo";
import { tagLabel } from "@app/utils/noteTags";
import LinkedPracticeSection from "./LinkedPracticeSection";

interface NoteDetailProps {
  note: BaseballNoteV2;
  themesResult: FetchResult<ImprovementTheme[]>;
  /** 紐付け済みの試合記録。取得できなかった分は含まれない。 */
  linkedGameResults: GameResultLinkOption[];
  /** 紐付いた練習記録。紐付けが無い、または取得に失敗した場合は null。 */
  practiceSession: PracticeSession | null;
  /** アイコンのカテゴリ判定用。取得に失敗した場合は空配列で既定アイコンに倒す。 */
  practiceMenus: PracticeMenu[];
}

function gameLabel(option: GameResultLinkOption): string {
  const opponent = option.opponent_team_name || "対戦相手未登録";
  return `${formatJaFullDate(option.date)} vs ${opponent}`;
}

/** ノート詳細の表示専用画面。編集は別画面（`/note/[id]/edit`）に分離している。 */
export default function NoteDetail({
  note,
  themesResult,
  linkedGameResults,
  practiceSession,
  practiceMenus,
}: NoteDetailProps) {
  const memoText = extractMemoText(note.memo);
  // 回答から自動合成された memo は回答欄と同じ内容が並ぶため、メモ欄には出さない。
  const showMemo =
    memoText.trim() !== "" &&
    !isReflectionMemo(memoText, note.reflection_answers);
  const themes = themesResult.status === "ok" ? themesResult.data : null;
  const categoryById = new Map(
    practiceMenus.map((menu) => [menu.id, menu.category]),
  );

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderNoteDetail noteId={note.id} />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-14 px-4 lg:px-6 lg:pb-14">
            <h3 className="text-sm font-bold text-zinc-400">
              {formatJaFullDate(note.date)}
            </h3>
            {note.title ? (
              <h2 className="mt-1 text-xl font-bold text-white">
                {note.title}
              </h2>
            ) : null}

            {showMemo ? (
              <div className="mt-6 rounded-xl bg-sub p-4">
                <h3 className="text-sm font-bold text-zinc-400">メモ</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">
                  {memoText}
                </p>
              </div>
            ) : null}

            <MediaAttachmentList
              attachments={note.media_attachments}
              noteId={note.id}
            />

            {note.reflection_answers.length > 0 ? (
              <section
                aria-labelledby="note-detail-reflection-heading"
                className="mt-8 rounded-xl bg-sub p-4"
              >
                <h3
                  id="note-detail-reflection-heading"
                  className="text-sm font-bold text-zinc-400"
                >
                  振り返り
                </h3>
                <div className="mt-2 space-y-4">
                  {note.reflection_answers.map(({ question, answer }) => (
                    <div key={question}>
                      <h4 className="text-xs font-bold text-zinc-400">
                        {question}
                      </h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white">
                        {answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {note.tags.length > 0 ? (
              <section
                aria-labelledby="note-detail-tag-heading"
                className="mt-8"
              >
                <h3
                  id="note-detail-tag-heading"
                  className="text-sm font-bold text-zinc-400"
                >
                  タグ
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-sub px-3.5 py-2 text-xs font-bold text-zinc-300"
                    >
                      {tagLabel(tag.name)}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {note.improvement_theme_ids.length > 0 ? (
              <section
                aria-labelledby="note-detail-theme-heading"
                className="mt-8"
              >
                <h3
                  id="note-detail-theme-heading"
                  className="flex items-center gap-1.5 text-sm font-bold text-zinc-400"
                >
                  <FlagIcon
                    className="h-[18px] w-[18px] shrink-0 text-[#d08000]"
                    aria-hidden
                  />
                  取り組んでいる課題
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {note.improvement_theme_ids.map((id) => {
                    const theme = themes?.find((item) => item.id === id);
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-2 rounded-lg bg-sub px-3 py-3"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-white">
                          {theme ? theme.title : "課題に紐付け済み"}
                        </span>
                        {theme ? (
                          <span className="shrink-0 rounded bg-main px-2 py-0.5 text-[11px] text-zinc-400">
                            {themeCategoryLabel(theme.category)}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {practiceSession ? (
              <LinkedPracticeSection
                session={practiceSession}
                categoryById={categoryById}
              />
            ) : null}

            {note.game_result_ids.length > 0 ? (
              <section
                aria-labelledby="note-detail-game-heading"
                className="mt-8"
              >
                <h3
                  id="note-detail-game-heading"
                  className="flex items-center gap-1.5 text-sm font-bold text-zinc-400"
                >
                  <BallIcon width="14" height="14" fill="#d08000" />
                  試合記録との紐付け
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {note.game_result_ids.map((id) => {
                    const option = linkedGameResults.find(
                      (item) => item.game_result_id === id,
                    );
                    return (
                      <li
                        key={id}
                        className="rounded-lg bg-sub px-3 py-3 text-sm text-white"
                      >
                        {option ? gameLabel(option) : "試合に紐付け済み"}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
