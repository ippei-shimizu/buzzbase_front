"use client";
import { Input } from "@heroui/react";
import dynamic from "next/dynamic";

const NoteEditor = dynamic(() => import("@app/components/note/NoteEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] bg-zinc-800 rounded-lg animate-pulse" />
  ),
});
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import HeaderNote from "@app/components/header/HeaderNote";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { createBaseballNote } from "@app/services/baseballNoteService";

export default function NoteNew() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [memoDate, setMemoDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [date, setDate] = useState(memoDate);
  const router = useRouter();
  const [initialValues, setInitialValues] = useState({
    date: "",
    title: "",
    memo: "",
  });

  useEffect(() => {
    setInitialValues({
      date: memoDate,
      title: "",
      memo: "",
    });
  }, [memoDate]);

  const hasChanges =
    date !== initialValues.date ||
    title !== initialValues.title ||
    memo !== initialValues.memo;

  // バリデーション
  const setErrorsWithTimeout = (newErrors: React.SetStateAction<string[]>) => {
    setErrors(newErrors);
    setTimeout(() => {
      setErrors([]);
    }, 2000);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = [];

    if (!date && !memoDate) {
      isValid = false;
      newErrors.push("日付が未設定です。");
    }

    if (!title && !memo) {
      isValid = false;
      newErrors.push("タイトルとメモ内容のどちらかを入力してください。");
    }

    if (!isValid) {
      setErrorsWithTimeout(newErrors);
    }

    return isValid;
  };

  const handleDateChange = async (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setDate(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    const effectiveDate = date || memoDate;
    try {
      const noteData = { date: effectiveDate, title, memo };
      await createBaseballNote(noteData);
      console.log(noteData);
      router.push("/note");
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <HeaderNote
          onNoteSave={() => handleSubmit({ preventDefault: () => {} })}
          isSubmitting={isSubmitting}
          hasChanges={hasChanges}
        />
        {isSubmitting && <LoadingSpinner />}
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
                      value={date ? date : memoDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      size="lg"
                      variant="underlined"
                      className="w-full [&>div]:pt-0.5 [&>div]:h-12 font-bold"
                      placeholder="タイトル"
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
    </>
  );
}
