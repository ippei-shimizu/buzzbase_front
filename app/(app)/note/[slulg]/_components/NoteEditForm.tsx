"use client";

import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import { Input } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderNote from "@app/components/header/HeaderNote";
import NoteMenu from "@app/components/note/NoteMenu";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { updateBaseballNote } from "@app/services/v2/baseballNoteService";
import { parseMemoToSlateValue } from "@app/utils/noteMemo";
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

export default function NoteEditForm({ note }: { note: BaseballNoteV2 }) {
  const router = useRouter();
  // エディタが最初の onChange で書き戻す形と揃えておくことで、カーソル移動だけで
  // 「変更あり」と判定されるのを防ぐ（v1 のプレーンテキスト memo でも同様）。
  const initialMemo = useMemo(
    () => JSON.stringify(parseMemoToSlateValue(note.memo)),
    [note.memo],
  );
  const initialValues = useMemo(
    () => ({ date: note.date, title: note.title ?? "", memo: initialMemo }),
    [note.date, note.title, initialMemo],
  );

  const [date, setDate] = useState(initialValues.date);
  const [title, setTitle] = useState(initialValues.title);
  const [memo, setMemo] = useState(initialValues.memo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 送るのは変更したキーだけ。試合 / 課題 / タグの紐付けはこの画面で編集しないため
  // キー自体を送らず、back 側の「未送信＝変更なし」に委ねる（送ると上書きされる）。
  const updateInput = buildNoteUpdateInput(initialValues, {
    date,
    title,
    memo,
  });
  const hasChanges = hasNoteChanges(updateInput);

  const setErrorsWithTimeout = (newErrors: string[]) => {
    setErrors(newErrors);
    setTimeout(() => setErrors([]), 2000);
  };

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
                <div className="flex justify-between items-center">
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
                  <NoteMenu noteId={note.id} />
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
                  <NoteEditor memo={initialValues.memo} setMemo={setMemo} />
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
