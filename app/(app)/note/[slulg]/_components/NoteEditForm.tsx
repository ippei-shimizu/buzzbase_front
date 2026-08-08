"use client";

import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import type { GameResultLinkOption } from "@app/types/gameResultLink";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import { Button, Input } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderNote from "@app/components/header/HeaderNote";
import NoteMediaSection from "@app/components/note/media/NoteMediaSection";
import NoteGameResultSection from "@app/components/note/NoteGameResultSection";
import NoteMenu from "@app/components/note/NoteMenu";
import NoteTagSection from "@app/components/note/NoteTagSection";
import NoteThemeSection from "@app/components/note/NoteThemeSection";
import ReflectionTemplateSection from "@app/components/note/ReflectionTemplateSection";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { useNoteTagEditing } from "@app/hooks/note/useNoteTagEditing";
import { updateBaseballNote } from "@app/services/v2/baseballNoteService";
import {
  buildGameResultIdsUpdate,
  buildImprovementThemeIdsUpdate,
} from "@app/utils/noteLinks";
import {
  buildAnswerList,
  extractMemoText,
  isReflectionMemo,
  parseMemoToSlateValue,
  resolveNoteMemo,
} from "@app/utils/noteMemo";
import { buildTagIdsUpdate } from "@app/utils/noteTags";
import {
  buildNoteUpdateInput,
  hasNoteChanges,
} from "@app/utils/noteUpdateInput";

const NoteEditor = dynamic(() => import("@app/components/note/NoteEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] bg-zinc-800 rounded-lg animate-pulse" />
  ),
});

interface NoteEditFormProps {
  note: BaseballNoteV2;
  templatesResult: FetchResult<ReflectionTemplate[]>;
  tagsResult: FetchResult<NoteTag[]>;
  themesResult: FetchResult<ImprovementTheme[]>;
  /** 紐付け済みの試合記録。取得できなかった分は含まれない。 */
  linkedGameResults: GameResultLinkOption[];
}

export default function NoteEditForm({
  note,
  templatesResult,
  tagsResult,
  themesResult,
  linkedGameResults,
}: NoteEditFormProps) {
  const router = useRouter();
  const { canEditTags } = useNoteTagEditing();
  // 回答から自動合成された memo は回答欄と同じ内容が並ぶため、自由メモ欄へは流し込まない。
  const isSynthesizedMemo = isReflectionMemo(
    extractMemoText(note.memo),
    note.reflection_answers,
  );
  // エディタが最初の onChange で書き戻す形と揃えておくことで、カーソル移動だけで
  // 「変更あり」と判定されるのを防ぐ（v1 のプレーンテキスト memo でも同様）。
  const editorMemo = useMemo(
    () =>
      JSON.stringify(
        parseMemoToSlateValue(isSynthesizedMemo ? null : note.memo),
      ),
    [note.memo, isSynthesizedMemo],
  );

  // テンプレは更新のたびに id が変わり削除もされうるため、問いはノートに保存済みの回答を
  // 正とする（テンプレから引き直すと過去ノートの問いが後から書き換わってしまう）。
  const questions = useMemo(
    () => note.reflection_answers.map((item) => item.question),
    [note.reflection_answers],
  );
  const initialAnswerMap = useMemo(
    () =>
      Object.fromEntries(
        note.reflection_answers.map((item) => [item.question, item.answer]),
      ),
    [note.reflection_answers],
  );

  const [date, setDate] = useState(note.date);
  const [title, setTitle] = useState(note.title ?? "");
  const [memo, setMemo] = useState(editorMemo);
  const [answers, setAnswers] =
    useState<Record<string, string>>(initialAnswerMap);
  const initialTagIds = useMemo(
    () => note.tags.map((tag) => tag.id),
    [note.tags],
  );
  const [tagIds, setTagIds] = useState<number[]>(initialTagIds);
  const [themeIds, setThemeIds] = useState<number[]>(
    note.improvement_theme_ids,
  );
  const [gameResultIds, setGameResultIds] = useState<number[]>(
    note.game_result_ids,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initialAnswers = buildAnswerList(questions, initialAnswerMap);
  const currentAnswers = buildAnswerList(questions, answers);
  const initialValues = {
    date: note.date,
    title: note.title ?? "",
    // 初期値も現在値と同じ手順で導出する。そうしないと合成メモのノートは開いただけで
    // 「変更あり」と判定されてしまう。
    memo: resolveNoteMemo(editorMemo, initialAnswers),
    reflectionAnswers: initialAnswers,
  };

  // 送るのは変更したキーだけ。テンプレ ID はこの画面で編集しないためキー自体を送らず、
  // back 側の「未送信＝変更なし」に委ねる（送ると上書きされる）。
  // 紐付け（試合 / 課題 / タグ）も、選択が実際に変わったときだけキーを生やす。
  // 変わったときは空配列でも必ず送る（`[]` が「全解除」の意思表示になる）。
  // メディア添付はノート更新とは別 API で即時反映するため、この入力には含めない。
  const updateInput = {
    ...buildNoteUpdateInput(initialValues, {
      date,
      title,
      // 回答を編集したら合成メモも作り直す。メモだけ古い回答のまま残すと本文と回答が食い違う。
      memo: resolveNoteMemo(memo, currentAnswers),
      reflectionAnswers: currentAnswers,
    }),
    ...buildTagIdsUpdate({ canEditTags, initialTagIds, tagIds }),
    ...buildImprovementThemeIdsUpdate({
      initialIds: note.improvement_theme_ids,
      ids: themeIds,
    }),
    ...buildGameResultIdsUpdate({
      initialIds: note.game_result_ids,
      ids: gameResultIds,
    }),
  };
  const hasChanges = hasNoteChanges(updateInput);

  const setErrorsWithTimeout = (newErrors: string[]) => {
    setErrors(newErrors);
    setTimeout(() => setErrors([]), 2000);
  };

  const handleChangeAnswer = (question: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [question]: answer }));

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!hasChanges) {
      router.push("/note");
      return;
    }
    setIsSubmitting(true);
    const result = await updateBaseballNote(note.id, updateInput);
    if (!result.ok) {
      setErrorsWithTimeout(result.errors);
      setIsSubmitting(false);
      return;
    }
    router.push("/note");
  };

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderNote hasChanges={hasChanges} />
      {isSubmitting ? <LoadingSpinner /> : null}
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <ErrorMessages errors={errors} />
          <div className="pt-14 px-4 lg:px-6 lg:pb-14">
            <form>
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-400">日付</h3>
                    <Input
                      isRequired
                      type="date"
                      size="sm"
                      variant="underlined"
                      className="w-28 [&>div&>div]:p-0"
                      aria-label="日付"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <NoteMenu noteId={note.id} />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-zinc-400">
                    タイトル（任意）
                  </h3>
                  <Input
                    type="text"
                    size="lg"
                    variant="underlined"
                    className="w-full [&>div]:pt-0.5 [&>div]:h-12 font-bold"
                    placeholder="タイトル"
                    aria-label="タイトル"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="mt-8 w-full h-full">
                  <h3 className="mb-2 text-sm font-bold text-zinc-400">メモ</h3>
                  <NoteEditor memo={editorMemo} setMemo={setMemo} />
                </div>
                <NoteMediaSection
                  noteId={note.id}
                  attachments={note.media_attachments}
                />
                <ReflectionTemplateSection
                  templatesResult={templatesResult}
                  selectedTemplateId={note.reflection_template_id}
                  questions={questions}
                  answers={answers}
                  onChangeAnswer={handleChangeAnswer}
                  locked
                />
                <NoteTagSection
                  tagsResult={tagsResult}
                  selectedIds={tagIds}
                  onChange={setTagIds}
                  canEdit={canEditTags}
                />
                <NoteThemeSection
                  themesResult={themesResult}
                  selectedIds={themeIds}
                  onChange={setThemeIds}
                  initialCount={note.improvement_theme_ids.length}
                />
                <NoteGameResultSection
                  selectedIds={gameResultIds}
                  onChange={setGameResultIds}
                  initialCount={note.game_result_ids.length}
                  linkedOptions={linkedGameResults}
                />
                <Button
                  type="button"
                  color="primary"
                  radius="sm"
                  fullWidth
                  className="mt-8 font-bold"
                  onPress={handleSubmit}
                  isDisabled={isSubmitting}
                >
                  保存
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
