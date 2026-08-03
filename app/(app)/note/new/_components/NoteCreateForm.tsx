"use client";

import { Input } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderNote from "@app/components/header/HeaderNote";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { createBaseballNote } from "@app/services/v2/baseballNoteService";
import { buildMemoJson } from "@app/utils/noteMemo";

const NoteEditor = dynamic(() => import("@app/components/note/NoteEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] bg-zinc-800 rounded-lg animate-pulse" />
  ),
});

/** 日付入力（`type="date"`）が要求する `YYYY-MM-DD` をローカル時刻で組み立てる。 */
function todayString(): string {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function NoteCreateForm() {
  const router = useRouter();
  const [initialDate] = useState(todayString);
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const hasChanges = date !== initialDate || title !== "" || memo !== "";

  const setErrorsWithTimeout = (newErrors: string[]) => {
    setErrors(newErrors);
    setTimeout(() => setErrors([]), 2000);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!date) {
      setErrorsWithTimeout(["日付が未設定です。"]);
      return;
    }
    if (!title && !memo) {
      setErrorsWithTimeout([
        "タイトルとメモ内容のどちらかを入力してください。",
      ]);
      return;
    }
    setIsSubmitting(true);
    // 紐付け・タグは新規作成画面では扱わないためキーごと送らない。
    const result = await createBaseballNote({
      date,
      title: title === "" ? null : title,
      memo: memo === "" ? buildMemoJson("") : memo,
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
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
