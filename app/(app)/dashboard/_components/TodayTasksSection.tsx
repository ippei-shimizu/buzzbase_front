"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { Plan, PlanMenu } from "@app/types/plan";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { buildPracticeRecordHref } from "@app/(app)/practice/schedules/_utils/scheduleRecord";
import { eventTypeMeta } from "@app/constants/schedule";
import {
  createPracticeLog,
  deletePracticeLog,
  getPracticeLogs,
} from "@app/services/v2/practiceLogService";
import {
  doneLogIdsOf,
  donePresetMenus,
  planMenuKey,
  setMenuDone,
} from "../_utils/todayPlans";
import {
  ADD_PLAN_LABEL,
  CALENDAR_LABEL,
  EMPTY_MESSAGE,
  LOAD_ERROR,
  RECORD_GAME_LABEL,
  RECORD_PRACTICE_HELPER,
  RECORD_PRACTICE_LABEL,
  SECTION_TITLE,
  TOGGLE_DONE_ERROR,
  TOGGLE_UNDONE_ERROR,
  WEEKLY_PLAN_LABEL,
  menuSetHint,
} from "./todayTasksCopy";

interface TodayTasksSectionProps {
  /** Asia/Tokyo の今日（YYYY-MM-DD）。練習ログの logged_on と記録画面への引き継ぎに使う。 */
  today: string;
  result: FetchResult<Plan[]>;
}

/**
 * ダッシュボードの「今日のやること」。
 *
 * 当日の予定（繰り返し ∪ 単発）は back が by_date で展開済みのものを受け取る。
 * メニューの「済」は練習ログ（practice_log）の作成／削除で表し、通信の往復を待たずに
 * 手元の状態を先に反転させる。失敗したら必ず元の値へ戻し、「済にしたのに保存されていない」
 * 状態を残さない。
 */
export default function TodayTasksSection({
  today,
  result,
}: TodayTasksSectionProps) {
  const [plans, setPlans] = useState<Plan[]>(
    result.status === "ok" ? result.data : [],
  );
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // state の反映を待たずに 2 回目のクリックが走るのを防ぐ。
  // 同じメニューを素早く 2 回押しても、作成と削除が交錯して「済」表示と実データがずれない。
  const pendingRef = useRef<Set<string>>(new Set());

  const syncPending = () => setPendingKeys(new Set(pendingRef.current));

  /** 「済」にする。量を伴わない完了マークなので amount は送らない。 */
  const markDone = async (
    scheduleId: number,
    practiceMenuId: number,
  ): Promise<boolean> => {
    // schedule_id を送らないと back が予定単位の「済」として数えず、済にならない。
    const created = await createPracticeLog({
      practice_menu_id: practiceMenuId,
      schedule_id: scheduleId,
      logged_on: today,
    });
    return created.ok;
  };

  /** 「済」を解除する。その予定・その日に作られたログだけを消す。 */
  const markUndone = async (
    scheduleId: number,
    practiceMenuId: number,
  ): Promise<boolean> => {
    const logs = await getPracticeLogs({ from: today, to: today });
    if (logs.status !== "ok") return false;

    const targetIds = doneLogIdsOf(logs.data, scheduleId, practiceMenuId);
    const deleted = await Promise.all(
      targetIds.map((logId) => deletePracticeLog(logId)),
    );
    return deleted.every((response) => response.ok);
  };

  const handleToggle = async (plan: Plan, menu: PlanMenu) => {
    const key = planMenuKey(plan.id, menu.practice_menu_id);
    if (pendingRef.current.has(key)) return;

    pendingRef.current.add(key);
    syncPending();

    const wasDone = menu.done;
    setPlans((previous) =>
      setMenuDone(previous, plan.id, menu.practice_menu_id, !wasDone),
    );

    const succeeded = wasDone
      ? await markUndone(plan.id, menu.practice_menu_id)
      : await markDone(plan.id, menu.practice_menu_id);

    pendingRef.current.delete(key);
    syncPending();

    if (!succeeded) {
      setPlans((previous) =>
        setMenuDone(previous, plan.id, menu.practice_menu_id, wasDone),
      );
      toast.error(wasDone ? TOGGLE_UNDONE_ERROR : TOGGLE_DONE_ERROR);
    }
  };

  const presetMenus = donePresetMenus(plans);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold">{SECTION_TITLE}</h3>
        <Link
          href="/practice/schedules/week"
          className="text-sm text-yellow-500 hover:underline"
        >
          {WEEKLY_PLAN_LABEL}
        </Link>
      </div>

      {result.status !== "ok" ? (
        // 取得失敗を「予定なし」と同じ見た目にすると、予定があるのに無いと誤読される。
        <p
          role="alert"
          className="rounded-lg border border-zinc-700 p-6 text-center text-sm text-zinc-400"
        >
          {LOAD_ERROR}
        </p>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-zinc-700 p-6 text-center">
          <p className="text-zinc-400">{EMPTY_MESSAGE}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {plans.map((plan) => {
            const meta = eventTypeMeta(plan.event_type);
            return (
              <li
                key={plan.id}
                data-testid={`today-plan-${plan.id}`}
                className="rounded-lg border border-zinc-700 p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      backgroundColor: `${meta.color}22`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  {plan.scheduled_time ? (
                    <span className="shrink-0 text-xs text-zinc-400">
                      {plan.scheduled_time}
                    </span>
                  ) : null}
                  <Link
                    href={`/practice/schedules/${plan.id}?date=${today}`}
                    className="min-w-0 flex-1 truncate text-sm font-bold text-white hover:underline"
                  >
                    {plan.title ?? meta.label}
                  </Link>
                  {plan.done ? (
                    <CheckCircleIcon
                      data-testid={`today-plan-done-${plan.id}`}
                      className="h-4 w-4 shrink-0 text-[#4a8e32]"
                      aria-label="この予定は完了しています"
                    />
                  ) : null}
                </div>

                {plan.event_type === "game" ? (
                  <Link
                    href="/game-result/record"
                    className="mt-2 inline-block rounded-lg bg-[#EF4444]/10 px-3 py-1.5 text-xs font-bold text-[#EF4444] transition-opacity hover:opacity-90"
                  >
                    {RECORD_GAME_LABEL}
                  </Link>
                ) : null}

                {plan.menus.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-1">
                    {plan.menus.map((menu) => {
                      const key = planMenuKey(plan.id, menu.practice_menu_id);
                      return (
                        <li key={key}>
                          <label className="flex items-center gap-2.5 py-1 text-sm text-white">
                            <input
                              type="checkbox"
                              checked={menu.done}
                              disabled={pendingKeys.has(key)}
                              onChange={() => handleToggle(plan, menu)}
                              className="h-4 w-4 accent-[#d08000] disabled:opacity-50"
                            />
                            <span
                              className={
                                menu.done ? "text-zinc-400 line-through" : ""
                              }
                            >
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
                ) : null}

                {plan.menu_set_id !== null && plan.title !== null ? (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {menuSetHint(plan.title)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {presetMenus.length > 0 ? (
          <>
            <Link
              href={buildPracticeRecordHref(today, presetMenus)}
              className="flex w-full items-center justify-center rounded-[10px] bg-[#d08000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {RECORD_PRACTICE_LABEL}
            </Link>
            <p className="text-xs text-zinc-400">{RECORD_PRACTICE_HELPER}</p>
          </>
        ) : null}

        <div className="flex gap-2">
          <Link
            href={`/practice/schedules/new?date=${today}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#d08000] px-3 py-2.5 text-xs font-bold text-[#d08000] transition-colors hover:bg-[#d08000]/10"
          >
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            {ADD_PLAN_LABEL}
          </Link>
          <Link
            href="/practice/schedules/calendar"
            className="flex flex-1 items-center justify-center rounded-[10px] border border-zinc-600 px-3 py-2.5 text-xs font-bold text-zinc-200 transition-colors hover:border-[#d08000] hover:text-[#d08000]"
          >
            {CALENDAR_LABEL}
          </Link>
        </div>
      </div>
    </section>
  );
}
