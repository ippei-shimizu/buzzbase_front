"use client";

import type { ImprovementTheme } from "@app/types/improvementTheme";
import type {
  PracticeMenu,
  PracticeSession,
  PresetMenu,
} from "@app/types/practice";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { Input } from "@heroui/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { getPracticeSessionByDate } from "@app/services/v2/practiceSessionService";
import { isFutureDate } from "../_utils/practiceRecordDraft";
import {
  CREATE_FIRST_MENU_LABEL,
  DATE_LABEL,
  MENUS_EMPTY_DESCRIPTION,
  MENUS_EMPTY_TITLE,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  SESSION_LOADING_MESSAGE,
  SESSION_LOAD_ERROR,
} from "./practiceRecordCopy";
import PracticeSessionForm from "./PracticeSessionForm";

interface PracticeRecordContentProps {
  /** Asia/Tokyo の今日。未来日を選ばせないための上限として使う。 */
  today: string;
  initialDate: string;
  menus: PracticeMenu[];
  initialSession: PracticeSession | null;
  /** 初期表示の by_date が失敗したか。null（記録なし）と取り違えないためにフラグで分ける。 */
  initialLoadFailed: boolean;
  presetMenus: PresetMenu[];
  themes: ImprovementTheme[];
}

/**
 * 練習記録画面の Container。
 * 日付の切り替えと既存セッションの読み込みを担い、入力フォームは日付ごとに作り直す。
 */
export default function PracticeRecordContent({
  today,
  initialDate,
  menus,
  initialSession,
  initialLoadFailed,
  presetMenus,
  themes,
}: PracticeRecordContentProps) {
  const [date, setDate] = useState(initialDate);
  const [session, setSession] = useState<PracticeSession | null>(
    initialSession,
  );
  const [loadFailed, setLoadFailed] = useState(initialLoadFailed);
  const [isLoading, setIsLoading] = useState(false);
  // 日付を素早く切り替えたとき、古い応答が後から届いて別日の記録を表示しないようにする。
  const latestRequest = useRef(0);

  const handleDateChange = async (nextDate: string) => {
    if (nextDate === "" || nextDate === date) return;
    // 未来日は記録できないため、選ばれても切り替えない。
    if (isFutureDate(nextDate, today)) return;

    setDate(nextDate);
    setIsLoading(true);
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    const result = await getPracticeSessionByDate(nextDate);
    if (latestRequest.current !== requestId) return;

    setIsLoading(false);
    // status:"ok" かつ data:null は「その日はまだ記録なし」。取得失敗と区別して空フォームを出す。
    if (result.status === "ok") {
      setSession(result.data);
      setLoadFailed(false);
      return;
    }
    setSession(null);
    setLoadFailed(true);
  };

  // プリセットは URL の日付に紐づく指示なので、別の日へ切り替えたら注入しない。
  const activePresetMenus = date === initialDate ? presetMenus : [];

  return (
    <>
      <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
      <p className="mt-2 text-sm text-zinc-300">{PAGE_DESCRIPTION}</p>

      <div className="mt-6">
        <Input
          type="date"
          size="sm"
          radius="sm"
          className="w-44"
          label={DATE_LABEL}
          labelPlacement="outside"
          max={today}
          value={date}
          onChange={(event) => handleDateChange(event.target.value)}
        />
      </div>

      {menus.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-base font-bold text-white">{MENUS_EMPTY_TITLE}</p>
          <p className="text-sm text-zinc-400">{MENUS_EMPTY_DESCRIPTION}</p>
          <Link
            href="/practice/menus"
            className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-[#d08000] px-5 py-3 text-sm font-bold text-white"
          >
            <PlusIcon className="h-5 w-5" aria-hidden />
            {CREATE_FIRST_MENU_LABEL}
          </Link>
        </div>
      ) : isLoading ? (
        <p className="mt-10 text-center text-sm text-zinc-400">
          {SESSION_LOADING_MESSAGE}
        </p>
      ) : loadFailed ? (
        <p role="alert" className="mt-10 text-center text-sm text-zinc-400">
          {SESSION_LOAD_ERROR}
        </p>
      ) : (
        <PracticeSessionForm
          key={date}
          date={date}
          menus={menus}
          session={session}
          presetMenus={activePresetMenus}
          themes={themes}
          onSaved={setSession}
        />
      )}
    </>
  );
}
