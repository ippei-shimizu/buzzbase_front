"use client";

import type { Schedule } from "@app/types/schedule";
import BellAlertIcon from "@heroicons/react/24/outline/BellAlertIcon";
import BellSlashIcon from "@heroicons/react/24/outline/BellSlashIcon";
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import ChatBubbleLeftEllipsisIcon from "@heroicons/react/24/outline/ChatBubbleLeftEllipsisIcon";
import ClockIcon from "@heroicons/react/24/outline/ClockIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  dayLabels,
  eventTypeMeta,
  scheduleTimeLabel,
} from "@app/constants/schedule";
import {
  createPracticeLog,
  deletePracticeLog,
} from "@app/services/v2/practiceLogService";
import { deleteSchedule } from "@app/services/v2/scheduleService";
import {
  DELETE_CONFIRM_TITLE,
  DELETE_KEEPS_LOGS_NOTICE,
  DELETE_LABEL,
  DONE_LOAD_ERROR,
  DONE_SECTION_TITLE,
  EDIT_LABEL,
  RECORD_GAME_LABEL,
  RECORD_PRACTICE_HELPER,
  RECORD_PRACTICE_LABEL,
} from "../../_components/scheduleCopy";
import {
  buildPracticeRecordHref,
  doneMenusAsPresets,
} from "../../_utils/scheduleRecord";

interface ScheduleDetailContentProps {
  schedule: Schedule;
  /** 「済」を判定する日付（YYYY-MM-DD）。練習記録への引き継ぎにもこの日付を使う。 */
  contextDate: string;
  /** practice_menu_id → その日この予定で作られた練習ログの ID 一覧。 */
  initialDoneLogIds: Record<number, number[]>;
  /** 当日ログの取得に失敗したか。「済が無い」と取り違えないためフラグで分ける。 */
  logsLoadFailed: boolean;
}

const ICON_CLASS = "h-4.5 w-4.5 shrink-0 text-zinc-400";

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2.5 border-b-1 border-zinc-700 py-2.5 text-sm text-white">
      {icon}
      <span className="min-w-0 flex-1 break-words">{label}</span>
    </li>
  );
}

/**
 * 予定詳細の Container。
 * メニューの「済」トグル（練習ログの作成／削除）と、済メニューを引き継いだ記録画面への導線を担う。
 */
export default function ScheduleDetailContent({
  schedule,
  contextDate,
  initialDoneLogIds,
  logsLoadFailed,
}: ScheduleDetailContentProps) {
  const router = useRouter();
  const [doneLogIds, setDoneLogIds] =
    useState<Record<number, number[]>>(initialDoneLogIds);
  // メニューごとに進行中のリクエストを追跡する（単一値だと、別メニューのトグルで
  // 前のメニューが再送信可能になり、同じメニューの練習ログが二重作成されうるため）。
  const [togglingMenuIds, setTogglingMenuIds] = useState<Set<number>>(
    new Set(),
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const meta = eventTypeMeta(schedule.event_type);
  const timeLabel = scheduleTimeLabel(
    schedule.scheduled_time,
    schedule.end_time,
  );
  const whenLabel = schedule.days_of_week
    ? `毎週 ${dayLabels(schedule.days_of_week)}`
    : (schedule.planned_on ?? contextDate);

  const isDone = (menuId: number) => (doneLogIds[menuId]?.length ?? 0) > 0;

  const setToggling = (menuId: number, isToggling: boolean) =>
    setTogglingMenuIds((prev) => {
      const next = new Set(prev);
      if (isToggling) {
        next.add(menuId);
      } else {
        next.delete(menuId);
      }
      return next;
    });

  const handleToggle = async (menuId: number) => {
    if (togglingMenuIds.has(menuId)) return;
    setToggling(menuId, true);
    const logIds = doneLogIds[menuId] ?? [];

    if (logIds.length > 0) {
      const results = await Promise.all(
        logIds.map((logId) => deletePracticeLog(logId)),
      );
      setToggling(menuId, false);
      if (results.some((result) => !result.ok)) {
        toast.error("「済」の解除に失敗しました");
        return;
      }
      setDoneLogIds((prev) => {
        const next = { ...prev };
        delete next[menuId];
        return next;
      });
      router.refresh();
      return;
    }

    // 量を伴わない完了マークなので amount は送らない（練習記録画面で後から入力できる）。
    const result = await createPracticeLog({
      practice_menu_id: menuId,
      schedule_id: schedule.id,
      logged_on: contextDate,
    });
    setToggling(menuId, false);
    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    setDoneLogIds((prev) => ({ ...prev, [menuId]: [result.data.id] }));
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteSchedule(schedule.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    toast.success("予定を削除しました");
    router.push("/practice/plans?tab=calendar");
    router.refresh();
  };

  const practiceRecordHref = buildPracticeRecordHref(
    contextDate,
    doneMenusAsPresets(schedule.menus, doneLogIds),
  );

  return (
    <>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1 h-10 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-xl font-bold text-white">
            {schedule.title ?? meta.label}
          </h2>
          <span
            className="mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <ul className="mt-5">
        <InfoRow
          icon={<CalendarDaysIcon className={ICON_CLASS} aria-hidden />}
          label={whenLabel}
        />
        {timeLabel ? (
          <InfoRow
            icon={<ClockIcon className={ICON_CLASS} aria-hidden />}
            label={timeLabel}
          />
        ) : null}
        {schedule.note ? (
          <InfoRow
            icon={<DocumentTextIcon className={ICON_CLASS} aria-hidden />}
            label={schedule.note}
          />
        ) : null}
        <InfoRow
          icon={
            schedule.notification_enabled ? (
              <BellAlertIcon className={ICON_CLASS} aria-hidden />
            ) : (
              <BellSlashIcon className={ICON_CLASS} aria-hidden />
            )
          }
          label={
            schedule.notification_enabled
              ? "リマインド通知 オン（アプリ版で届きます）"
              : "リマインド通知 オフ"
          }
        />
        {schedule.notification_message ? (
          <InfoRow
            icon={
              <ChatBubbleLeftEllipsisIcon className={ICON_CLASS} aria-hidden />
            }
            label={schedule.notification_message}
          />
        ) : null}
      </ul>

      {schedule.menus.length > 0 ? (
        <section className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-zinc-400">
            {DONE_SECTION_TITLE}（{contextDate}）
          </h3>
          {logsLoadFailed ? (
            <p role="alert" className="mb-2 text-xs text-zinc-400">
              {DONE_LOAD_ERROR}
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {schedule.menus.map((menu) => {
              const done = isDone(menu.practice_menu_id);
              return (
                <li key={menu.practice_menu_id}>
                  <label className="flex items-center gap-2.5 rounded-[10px] bg-sub px-3.5 py-3 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={done}
                      disabled={
                        logsLoadFailed ||
                        togglingMenuIds.has(menu.practice_menu_id)
                      }
                      onChange={() => handleToggle(menu.practice_menu_id)}
                      className="h-4 w-4 accent-[#d08000] disabled:opacity-50"
                    />
                    <span className={done ? "text-zinc-400 line-through" : ""}>
                      {menu.name ?? "メニュー"}
                      {menu.target_value !== null
                        ? ` ${menu.target_value}${menu.unit_label ?? ""}`
                        : ""}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {schedule.note ? (
        <section className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-zinc-400">メモ</h3>
          <p className="whitespace-pre-wrap text-sm text-white">
            {schedule.note}
          </p>
        </section>
      ) : null}

      <div className="mt-8 flex flex-col gap-2">
        {schedule.event_type === "game" ? (
          <Link
            href="/game-result/record"
            className="flex w-full items-center justify-center rounded-[10px] bg-[#d08000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {RECORD_GAME_LABEL}
          </Link>
        ) : (
          <>
            <Link
              href={practiceRecordHref}
              className="flex w-full items-center justify-center rounded-[10px] bg-[#d08000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {RECORD_PRACTICE_LABEL}
            </Link>
            <p className="text-xs text-zinc-400">{RECORD_PRACTICE_HELPER}</p>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          as={Link}
          href={`/practice/schedules/${schedule.id}/edit`}
          variant="flat"
          radius="sm"
          className="flex-1"
        >
          {EDIT_LABEL}
        </Button>
        <Button
          color="danger"
          variant="flat"
          radius="sm"
          className="flex-1"
          onPress={() => setIsDeleteOpen(true)}
        >
          {DELETE_LABEL}
        </Button>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">
            {DELETE_CONFIRM_TITLE}
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{schedule.title ?? meta.label}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">{DELETE_KEEPS_LOGS_NOTICE}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setIsDeleteOpen(false)}
              isDisabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              {DELETE_LABEL}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
