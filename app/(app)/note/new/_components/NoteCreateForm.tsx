"use client";

import type { NoteTag, ReflectionAnswer } from "@app/interface/baseballNoteV2";
import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import { Input } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderNote from "@app/components/header/HeaderNote";
import NoteGameResultSection from "@app/components/note/NoteGameResultSection";
import NoteTagSection from "@app/components/note/NoteTagSection";
import NoteThemeSection from "@app/components/note/NoteThemeSection";
import ReflectionTemplateSection from "@app/components/note/ReflectionTemplateSection";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { useNoteTagEditing } from "@app/hooks/note/useNoteTagEditing";
import { createBaseballNote } from "@app/services/v2/baseballNoteService";
import {
  buildGameResultIdsPayload,
  buildImprovementThemeIdsPayload,
} from "@app/utils/noteLinks";
import { buildAnswerList, resolveNoteMemo } from "@app/utils/noteMemo";
import { buildTagIdsPayload } from "@app/utils/noteTags";

const NoteEditor = dynamic(() => import("@app/components/note/NoteEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] bg-zinc-800 rounded-lg animate-pulse" />
  ),
});

interface NoteCreateFormProps {
  templatesResult: FetchResult<ReflectionTemplate[]>;
  tagsResult: FetchResult<NoteTag[]>;
  themesResult: FetchResult<ImprovementTheme[]>;
  /** 課題詳細の「この課題でノートを書く」から来たときに、あらかじめ紐付けておく課題。 */
  initialThemeIds?: number[];
}

/** 日付入力（`type="date"`）が要求する `YYYY-MM-DD` をローカル時刻で組み立てる。 */
function todayString(): string {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function NoteCreateForm({
  templatesResult,
  tagsResult,
  themesResult,
  initialThemeIds = [],
}: NoteCreateFormProps) {
  const router = useRouter();
  const { canEditTags } = useNoteTagEditing();
  const [initialDate] = useState(todayString);
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  // 回答は問い文をキーに保持する。テンプレを切り替えて戻ってきても入力済みの回答が残る。
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [themeIds, setThemeIds] = useState<number[]>(initialThemeIds);
  const [gameResultIds, setGameResultIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const reflectionAnswers: ReflectionAnswer[] = buildAnswerList(
    questions,
    answers,
  );
  const hasChanges =
    date !== initialDate ||
    title !== "" ||
    memo !== "" ||
    templateId !== null ||
    reflectionAnswers.length > 0 ||
    tagIds.length > 0 ||
    themeIds.length !== initialThemeIds.length ||
    gameResultIds.length > 0;

  const setErrorsWithTimeout = (newErrors: string[]) => {
    setErrors(newErrors);
    setTimeout(() => setErrors([]), 2000);
  };

  const handleSelectTemplate = (template: ReflectionTemplate | null) => {
    setTemplateId(template?.id ?? null);
    setQuestions(template?.questions ?? []);
  };

  const handleChangeAnswer = (question: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [question]: answer }));

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!date) {
      setErrorsWithTimeout(["日付が未設定です。"]);
      return;
    }
    if (!title && !memo && reflectionAnswers.length === 0) {
      setErrorsWithTimeout([
        "タイトルとメモ内容のどちらかを入力してください。",
      ]);
      return;
    }
    setIsSubmitting(true);
    // 紐付けが1件も無いときはキーごと落とす。
    // タグも Pro 判定が確定して entitlement を持つときだけキーを生やす。
    const result = await createBaseballNote({
      date,
      title: title === "" ? null : title,
      memo: resolveNoteMemo(memo, reflectionAnswers),
      reflection_template_id: templateId,
      reflection_answers: reflectionAnswers,
      ...buildImprovementThemeIdsPayload(themeIds),
      ...buildGameResultIdsPayload(gameResultIds),
      ...buildTagIdsPayload({ canEditTags, tagIds }),
    });
    if (!result.ok) {
      setErrorsWithTimeout(result.errors);
      setIsSubmitting(false);
      return;
    }
    router.push("/note");
  };

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderNote
        onNoteSave={handleSubmit}
        isSubmitting={isSubmitting}
        hasChanges={hasChanges}
      />
      {isSubmitting ? <LoadingSpinner /> : null}
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <ErrorMessages errors={errors} />
          <div className="pt-14 px-4 lg:px-6 lg:pb-14">
            <form>
              <div>
                <div>
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
                <div>
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
                <div className="mt-10 w-full h-full">
                  <NoteEditor memo={memo} setMemo={setMemo} />
                </div>
                <ReflectionTemplateSection
                  templatesResult={templatesResult}
                  selectedTemplateId={templateId}
                  questions={questions}
                  answers={answers}
                  onSelectTemplate={handleSelectTemplate}
                  onChangeAnswer={handleChangeAnswer}
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
                  initialCount={0}
                />
                <NoteGameResultSection
                  selectedIds={gameResultIds}
                  onChange={setGameResultIds}
                  initialCount={0}
                  linkedOptions={[]}
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
