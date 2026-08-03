"use client";

import type { MenuSet } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import type { Schedule, ScheduleInput } from "@app/types/schedule";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const handleSubmit = async (input: ScheduleInput) => {
    setIsSaving(true);
    setServerErrors([]);

    const result = schedule
      ? await updateSchedule(schedule.id, input)
      : await createSchedule(input);
    setIsSaving(false);

    if (!result.ok) {
      setServerErrors(result.errors);
      return;
    }

    toast.success(schedule ? "予定を更新しました" : "予定を登録しました");
    router.push(`/practice/schedules/${result.data.id}`);
    router.refresh();
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
