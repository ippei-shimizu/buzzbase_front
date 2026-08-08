"use client";

import type { NoteTag, ReflectionAnswer } from "@app/interface/baseballNoteV2";
import type { StagedMediaAsset } from "@app/interface/mediaAttachmentV2";
import type { ReflectionTemplate } from "@app/interface/reflectionTemplate";
import type { FetchResult } from "@app/services/v2/requests";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import { Button, Input } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderNote from "@app/components/header/HeaderNote";
import {
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_NOTICE,
  FREE_LIMIT_TITLE,
  ROLLBACK_MESSAGE,
} from "@app/components/note/media/mediaCopy";
import StagedMediaSection from "@app/components/note/media/StagedMediaSection";
import NoteGameResultSection from "@app/components/note/NoteGameResultSection";
import NoteTagSection from "@app/components/note/NoteTagSection";
import NoteThemeSection from "@app/components/note/NoteThemeSection";
import ReflectionTemplateSection from "@app/components/note/ReflectionTemplateSection";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { useMediaUpload } from "@app/hooks/media/useMediaUpload";
import { useNoteTagEditing } from "@app/hooks/note/useNoteTagEditing";
import {
  createBaseballNote,
  deleteBaseballNote,
} from "@app/services/v2/baseballNoteService";
import {
  buildStagedUploadNotice,
  summarizeStagedUploads,
  toPreparedMedia,
} from "@app/utils/media/stagedUpload";
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

/** 保存は済んだが、添付の一部が上がらなかったときに見せる結果。 */
interface SaveOutcome {
  notice: string | null;
  isLimitReached: boolean;
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
  const { uploadAll } = useMediaUpload();
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
  const [stagedMedia, setStagedMedia] = useState<StagedMediaAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveOutcome, setSaveOutcome] = useState<SaveOutcome | null>(null);

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
    gameResultIds.length > 0 ||
    stagedMedia.length > 0;

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

  const handleRemoveStaged = (localId: string) =>
    setStagedMedia((prev) =>
      prev.filter((asset) => {
        if (asset.localId !== localId) return true;
        if (asset.previewUrl) URL.revokeObjectURL(asset.previewUrl);
        return false;
      }),
    );

  const handleUpdateStagedMemo = (localId: string, nextMemo: string) =>
    setStagedMedia((prev) =>
      prev.map((asset) =>
        asset.localId === localId ? { ...asset, memo: nextMemo } : asset,
      ),
    );

  /**
   * ノート保存後にステージ中のメディアを順にアップロードする。
   *
   * 技術的失敗（通信断・5xx など）が1件でもあればノートごと取り消す。添付ありきで
   * 書かれたノートが本文だけ残るのを防ぐため。逆にユーザーが中断した場合と、
   * サーバーが内容や上限を理由に拒否した場合は取り消さない。書いた本文を本人の
   * 意図に反して消してしまうためで、その場合はノートを残したまま結果だけ伝える。
   */
  const uploadStagedMedia = async (noteId: number): Promise<void> => {
    const results = await uploadAll(stagedMedia.map(toPreparedMedia), noteId);
    const summary = summarizeStagedUploads(results);

    if (summary.shouldRollbackNote) {
      await deleteBaseballNote(noteId);
      setErrorsWithTimeout([ROLLBACK_MESSAGE]);
      setIsSubmitting(false);
      return;
    }

    stagedMedia.forEach((asset) => {
      if (asset.previewUrl) URL.revokeObjectURL(asset.previewUrl);
    });
    setStagedMedia([]);

    if (
      summary.limitReached > 0 ||
      summary.canceled > 0 ||
      summary.rejected > 0
    ) {
      setSaveOutcome({
        notice:
          summary.limitReached > 0
            ? FREE_LIMIT_NOTICE
            : buildStagedUploadNotice(summary),
        isLimitReached: summary.limitReached > 0,
      });
      setIsSubmitting(false);
      return;
    }

    router.push("/note");
  };

  const handleSubmit = async () => {
    if (isSubmitting || saveOutcome !== null) return;
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

    // 添付が無いときはアップロード経路を通さず、そのまま一覧へ戻す。
    if (stagedMedia.length === 0) {
      router.push("/note");
      return;
    }
    await uploadStagedMedia(result.data.id);
  };

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderNote hasChanges={hasChanges && saveOutcome === null} />
      {isSubmitting ? <LoadingSpinner /> : null}
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <ErrorMessages errors={errors} />
          <div className="pt-14 px-4 lg:px-6 lg:pb-14">
            {saveOutcome ? (
              <div className="py-10">
                <p className="text-sm text-white">{saveOutcome.notice}</p>
                {saveOutcome.isLimitReached ? (
                  <ProUpsellCard
                    feature="unlimited_media_uploads"
                    title={FREE_LIMIT_TITLE}
                    description={FREE_LIMIT_DESCRIPTION}
                    className="mt-4"
                  />
                ) : null}
                <Button
                  color="primary"
                  radius="sm"
                  fullWidth
                  className="mt-6 font-bold"
                  onPress={() => router.push("/note")}
                >
                  ノート一覧へ
                </Button>
              </div>
            ) : (
              <form>
                <div>
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
                    <h3 className="mb-2 text-sm font-bold text-zinc-400">
                      メモ
                    </h3>
                    <NoteEditor memo={memo} setMemo={setMemo} />
                  </div>
                  <StagedMediaSection
                    assets={stagedMedia}
                    onStage={(asset) =>
                      setStagedMedia((prev) => [...prev, asset])
                    }
                    onRemove={handleRemoveStaged}
                    onUpdateMemo={handleUpdateStagedMemo}
                  />
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
