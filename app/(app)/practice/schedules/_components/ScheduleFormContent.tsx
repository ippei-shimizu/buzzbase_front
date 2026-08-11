"use client";

import type { MenuSet } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import type { Schedule, ScheduleInput } from "@app/types/schedule";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  createSchedule,
  updateSchedule,
} from "@app/services/v2/scheduleService";
import ScheduleForm from "./ScheduleForm";

interface ScheduleFormContentProps {
  /** 編集対象。null なら新規作成。 */
  schedule: Schedule | null;
  menus: PracticeMenu[];
  menuSets: MenuSet[];
  today: string;
}

/**
 * 予定フォーム画面の Container。
 * Server Action の呼び出しと保存後の遷移を担い、入力 UI は ScheduleForm に委ねる。
 */
export default function ScheduleFormContent({
  schedule,
  menus,
  menuSets,
  today,
}: ScheduleFormContentProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  // isSaving は再レンダリング後にしかボタンへ反映されず、同一フレーム内の2度押しを
  // 止められない。同じ予定が2件登録されるのを防ぐため ref でも実行中を持つ。
  const isSavingRef = useRef(false);

  const handleSubmit = async (input: ScheduleInput) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setServerErrors([]);

    const result = schedule
      ? await updateSchedule(schedule.id, input)
      : await createSchedule(input);
    setIsSaving(false);

    if (!result.ok) {
      isSavingRef.current = false;
      setServerErrors(result.errors);
      return;
    }

    toast.success(schedule ? "予定を更新しました" : "予定を登録しました");
    // 新規登録はフォームに留まらせない。追加の起点であるカレンダーへ戻し、
    // 同じ内容を続けて送信できる状態を残さない。
    router.refresh();
    router.push(
      schedule
        ? `/practice/schedules/${result.data.id}`
        : "/practice/plans?tab=calendar",
    );
  };

  return (
    <ScheduleForm
      schedule={schedule}
      menus={menus}
      menuSets={menuSets}
      today={today}
      isSaving={isSaving}
      serverErrors={serverErrors}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}
