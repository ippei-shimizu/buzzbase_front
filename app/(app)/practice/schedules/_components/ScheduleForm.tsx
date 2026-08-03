"use client";

import type { MenuSet } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import type {
  Schedule,
  ScheduleEventType,
  ScheduleInput,
} from "@app/types/schedule";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import { Button, Input, Switch } from "@heroui/react";
import { useState } from "react";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { parseDecimal } from "@app/constants/practice";
import {
  EVENT_TYPES,
  SCHEDULE_TITLE_MAX_LENGTH,
  WEEK_DAYS,
} from "@app/constants/schedule";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  type ScheduleMenuSource,
  type ScheduleRecurrence,
  buildScheduleInput,
  validateScheduleInput,
} from "../_utils/scheduleForm";
import {
  CANCEL_LABEL,
  DATE_LABEL,
  EVENT_TYPE_LABEL,
  LOCKED_MENU_BADGE,
  LOCKED_MENU_NOTICE,
  LOCKED_MENU_SOURCE_NOTICE,
  MENUS_EMPTY,
  MENU_LABEL,
  MENU_SETS_EMPTY,
  MENU_SOURCE_INDIVIDUAL_LABEL,
  MENU_SOURCE_SET_LABEL,
  NOTIFICATION_LABEL,
  NOTIFICATION_MESSAGE_LABEL,
  NOTIFICATION_MESSAGE_PLACEHOLDER,
  NOTIFICATION_WEB_NOTICE,
  RECURRENCE_LABEL,
  RECURRENCE_SINGLE_LABEL,
  RECURRENCE_WEEKLY_LABEL,
  SAVE_LABEL,
  TIME_LABEL,
  TITLE_HELPER,
  TITLE_LABEL,
  TITLE_OPTIONAL_LABEL,
  UPDATE_LABEL,
} from "./scheduleCopy";

interface ScheduleFormProps {
  /** 編集対象。null なら新規作成。 */
  schedule: Schedule | null;
  menus: PracticeMenu[];
  menuSets: MenuSet[];
  /** 新規作成時に初期表示する日付（Asia/Tokyo の今日）。 */
  today: string;
  isSaving: boolean;
  /** 保存に失敗したときに出すサーバー由来のメッセージ。 */
  serverErrors: string[];
  onSubmit: (input: ScheduleInput) => void;
  onCancel: () => void;
}

const SEGMENT_BASE =
  "flex-1 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000]";
const CHIP_BASE =
  "rounded-full px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000]";

/** 目標量の表示用文字列。back の decimal は文字列で返るため数値化してから入力欄へ流す。 */
function toAmountText(value: number | null): string {
  const parsed = parseDecimal(value);
  return parsed === null ? "" : String(parsed);
}

/**
 * 編集可能なメニューの目標量の初期値。
 * 記録済み（ロック）メニューは入力状態として持たず、送信時にサーバー由来の値をそのまま
 * 足し戻す。ユーザー操作の状態に混ぜると、UI の無効化を外しただけで紐付けを失いうる。
 */
function initialMenuAmounts(
  schedule: Schedule | null,
  lockedIds: Set<number>,
): Record<number, string> {
  if (!schedule || schedule.menu_set_id !== null) return {};
  const amounts: Record<number, string> = {};
  schedule.menus.forEach((menu) => {
    if (lockedIds.has(menu.practice_menu_id)) return;
    amounts[menu.practice_menu_id] = toAmountText(menu.target_value);
  });
  return amounts;
}

/**
 * 予定の作成・編集フォーム。
 *
 * 入力値の保持とクライアント側バリデーションだけを担い、
 * API 呼び出しと画面遷移は呼び出し元（Container）に委ねる。
 * 初期値は props からマウント時に一度だけ組み立てる（useEffect での同期はしない）。
 */
export default function ScheduleForm({
  schedule,
  menus,
  menuSets,
  today,
  isSaving,
  serverErrors,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const canCustomizeMessage = hasEntitlement("custom_notification_messages");

  // 記録済みメニューは「済」判定の整合が壊れるため、選択解除も目標量の変更もさせない。
  const lockedIds = new Set(schedule?.logged_practice_menu_ids ?? []);
  const lockedMenus = (schedule?.menus ?? []).filter((menu) =>
    lockedIds.has(menu.practice_menu_id),
  );
  const hasLockedMenu = lockedMenus.length > 0;
  const lockedAmounts = new Map(
    lockedMenus.map((menu) => [menu.practice_menu_id, menu.target_value]),
  );

  const [recurrence, setRecurrence] = useState<ScheduleRecurrence>(
    schedule?.days_of_week ? "weekly" : "single",
  );
  const [eventType, setEventType] = useState<ScheduleEventType>(
    schedule?.event_type ?? "self_practice",
  );
  const [title, setTitle] = useState(schedule?.title ?? "");
  const [days, setDays] = useState<number[]>(
    schedule?.days_of_week ? schedule.days_of_week.split(",").map(Number) : [],
  );
  const [plannedOn, setPlannedOn] = useState(schedule?.planned_on ?? today);
  const [scheduledTime, setScheduledTime] = useState(
    schedule?.scheduled_time ?? "06:00",
  );
  const [menuSource, setMenuSource] = useState<ScheduleMenuSource>(
    schedule?.menu_set_id ? "set" : "individual",
  );
  const [menuSetId, setMenuSetId] = useState<number | null>(
    schedule?.menu_set_id ?? null,
  );
  const [menuAmounts, setMenuAmounts] = useState<Record<number, string>>(() =>
    initialMenuAmounts(schedule, lockedIds),
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    schedule?.notification_enabled ?? true,
  );
  const [notificationMessage, setNotificationMessage] = useState(
    schedule?.notification_message ?? "",
  );
  const [errors, setErrors] = useState<string[]>([]);

  const usingSet = menuSource === "set" && menuSetId !== null;

  const toggleDay = (num: number) =>
    setDays((prev) =>
      prev.includes(num) ? prev.filter((day) => day !== num) : [...prev, num],
    );

  const toggleMenu = (menuId: number, defaultValue: string) => {
    if (lockedIds.has(menuId)) return;
    setMenuAmounts((prev) => {
      if (menuId in prev) {
        const next = { ...prev };
        delete next[menuId];
        return next;
      }
      return { ...prev, [menuId]: defaultValue };
    });
  };

  const changeMenuAmount = (menuId: number, amount: string) => {
    if (lockedIds.has(menuId)) return;
    setMenuAmounts((prev) => ({ ...prev, [menuId]: amount }));
  };

  const handleMenuSourceChange = (next: ScheduleMenuSource) => {
    // セットへ切り替えると個別紐付けが全置換され、ロック対象が外れてしまう。
    if (next === "set" && hasLockedMenu) return;
    setMenuSource(next);
  };

  const handleSubmit = () => {
    const input = buildScheduleInput(
      {
        recurrence,
        eventType,
        title,
        days,
        plannedOn,
        scheduledTime,
        menuSource,
        menuSetId,
        menuAmounts,
        notificationEnabled,
        notificationMessage,
      },
      { canCustomizeMessage, lockedMenus },
    );

    const validationErrors = validateScheduleInput(input);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    onSubmit(input);
  };

  const messages = errors.length > 0 ? errors : serverErrors;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1.5 text-sm text-white">{RECURRENCE_LABEL}</p>
        <div
          className="flex overflow-hidden rounded-lg border-1 border-zinc-600"
          role="group"
          aria-label={RECURRENCE_LABEL}
        >
          {(
            [
              ["single", RECURRENCE_SINGLE_LABEL],
              ["weekly", RECURRENCE_WEEKLY_LABEL],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={recurrence === value}
              onClick={() => setRecurrence(value)}
              className={`${SEGMENT_BASE} ${
                recurrence === value
                  ? "bg-[#d08000] text-white"
                  : "bg-sub text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {recurrence === "weekly" ? (
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="曜日"
          >
            {WEEK_DAYS.map((day) => {
              const isActive = days.includes(day.num);
              return (
                <button
                  key={day.num}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleDay(day.num)}
                  className={`h-10 w-10 rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] ${
                    isActive
                      ? "bg-[#d08000] text-white"
                      : "bg-sub text-zinc-400"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3">
            <Input
              type="date"
              variant="bordered"
              size="sm"
              radius="sm"
              className="w-48"
              label={DATE_LABEL}
              labelPlacement="outside"
              value={plannedOn}
              onChange={(event) => setPlannedOn(event.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-sm text-white">{EVENT_TYPE_LABEL}</p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={EVENT_TYPE_LABEL}
        >
          {EVENT_TYPES.map((item) => {
            const isActive = item.value === eventType;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setEventType(item.value)}
                className={`${CHIP_BASE} ${
                  isActive
                    ? "text-white"
                    : "bg-sub text-zinc-400 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: item.color } : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <Input
        type="text"
        variant="bordered"
        label={usingSet ? TITLE_OPTIONAL_LABEL : TITLE_LABEL}
        labelPlacement="outside"
        isRequired={!usingSet}
        maxLength={SCHEDULE_TITLE_MAX_LENGTH}
        placeholder={eventType === "game" ? "vs 港南高" : "例: 朝の素振り"}
        description={TITLE_HELPER}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <Input
        type="time"
        variant="bordered"
        size="sm"
        radius="sm"
        className="w-40"
        label={TIME_LABEL}
        labelPlacement="outside"
        value={scheduledTime}
        onChange={(event) => setScheduledTime(event.target.value)}
      />

      <div>
        <p className="mb-1.5 text-sm text-white">{MENU_LABEL}</p>
        <div
          className="flex overflow-hidden rounded-lg border-1 border-zinc-600"
          role="group"
          aria-label={MENU_LABEL}
        >
          {(
            [
              ["individual", MENU_SOURCE_INDIVIDUAL_LABEL],
              ["set", MENU_SOURCE_SET_LABEL],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={menuSource === value}
              disabled={value === "set" && hasLockedMenu}
              onClick={() => handleMenuSourceChange(value)}
              className={`${SEGMENT_BASE} disabled:opacity-40 ${
                menuSource === value
                  ? "bg-[#d08000] text-white"
                  : "bg-sub text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {hasLockedMenu ? (
          <p className="mt-2 text-xs text-zinc-400">
            {LOCKED_MENU_SOURCE_NOTICE}
          </p>
        ) : null}

        {menuSource === "set" ? (
          <div className="mt-3">
            {menuSets.length === 0 ? (
              <p className="text-xs text-zinc-400">{MENU_SETS_EMPTY}</p>
            ) : (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={MENU_SOURCE_SET_LABEL}
              >
                {menuSets.map((set) => {
                  const isActive = menuSetId === set.id;
                  return (
                    <button
                      key={set.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() =>
                        setMenuSetId((prev) =>
                          prev === set.id ? null : set.id,
                        )
                      }
                      className={`${CHIP_BASE} ${
                        isActive
                          ? "bg-[#d08000] text-white"
                          : "bg-sub text-zinc-400 hover:text-white"
                      }`}
                    >
                      {set.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3">
            {hasLockedMenu ? (
              <p className="mb-2 text-xs text-zinc-400">{LOCKED_MENU_NOTICE}</p>
            ) : null}
            {menus.length === 0 ? (
              <p className="text-xs text-zinc-400">{MENUS_EMPTY}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {menus.map((menu) => {
                  const isLocked = lockedIds.has(menu.id);
                  const isSelected = isLocked || menu.id in menuAmounts;
                  const defaultValue = parseDecimal(menu.default_value);
                  return (
                    <li
                      key={menu.id}
                      className="rounded-[10px] bg-sub px-3.5 py-3"
                    >
                      <label className="flex items-center gap-2.5 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isLocked}
                          onChange={() =>
                            toggleMenu(
                              menu.id,
                              defaultValue === null ? "" : String(defaultValue),
                            )
                          }
                          className="h-4 w-4 accent-[#d08000] disabled:opacity-50"
                        />
                        <span className={isLocked ? "text-zinc-400" : ""}>
                          {menu.name}
                        </span>
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#2E2E2E] px-2 py-0.5 text-[11px] font-bold text-zinc-400">
                            <LockClosedIcon className="h-3 w-3" aria-hidden />
                            {LOCKED_MENU_BADGE}
                          </span>
                        ) : null}
                      </label>
                      {isSelected ? (
                        <div className="mt-2.5 flex items-center gap-2 pl-6">
                          <input
                            type="number"
                            aria-label={`${menu.name}の目標量`}
                            value={
                              isLocked
                                ? toAmountText(
                                    lockedAmounts.get(menu.id) ?? null,
                                  )
                                : (menuAmounts[menu.id] ?? "")
                            }
                            disabled={isLocked}
                            onChange={(event) =>
                              changeMenuAmount(menu.id, event.target.value)
                            }
                            className="w-28 rounded-lg bg-main px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                          />
                          <span className="text-sm text-zinc-400">
                            {menu.unit_label ?? ""}
                          </span>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <Switch
          isSelected={notificationEnabled}
          onValueChange={setNotificationEnabled}
          color="primary"
          size="sm"
          classNames={{ label: "text-sm text-white" }}
        >
          {NOTIFICATION_LABEL}
        </Switch>
        <p className="mt-1.5 text-xs text-zinc-400">
          {NOTIFICATION_WEB_NOTICE}
        </p>
      </div>

      {isEntitlementLoading ? null : canCustomizeMessage ? (
        <Input
          type="text"
          variant="bordered"
          label={NOTIFICATION_MESSAGE_LABEL}
          labelPlacement="outside"
          placeholder={NOTIFICATION_MESSAGE_PLACEHOLDER}
          value={notificationMessage}
          onChange={(event) => setNotificationMessage(event.target.value)}
        />
      ) : (
        <ProUpsellCard feature="custom_notification_messages" />
      )}

      {messages.length > 0 ? (
        <ul role="alert" className="space-y-1 text-sm text-danger">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-3">
        <Button
          variant="flat"
          radius="sm"
          className="flex-1"
          onPress={onCancel}
          isDisabled={isSaving}
        >
          {CANCEL_LABEL}
        </Button>
        <Button
          color="primary"
          radius="sm"
          className="flex-1 font-bold"
          onPress={handleSubmit}
          isDisabled={isSaving}
          isLoading={isSaving}
        >
          {schedule ? UPDATE_LABEL : SAVE_LABEL}
        </Button>
      </div>
    </div>
  );
}
