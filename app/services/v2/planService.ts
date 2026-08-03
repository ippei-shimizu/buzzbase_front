"use server";

import type { CalendarResponse, Plan } from "@app/types/plan";
import { type FetchResult, buildQuery, fetchV2 } from "./requests";

const BASE_PATH = "/api/v2/plans";

/**
 * 指定日の予定を取得する（GET /api/v2/plans/by_date）。
 *
 * 繰り返し（曜日）と単発（planned_on）を back がその日付へ集約し、時刻順（未設定は末尾）で返す。
 * メニューの done は「その日・その予定で作られた練習ログの有無」で、予定単位に独立している。
 *
 * 予定が 1 件も無い日は 200 + 空配列が返る。取得失敗（status:"error"）と区別して扱うこと。
 *
 * @param date 対象日（YYYY-MM-DD）。不正な形式は back が 422 を返し error になる。
 */
export async function getDayPlan(date: string): Promise<FetchResult<Plan[]>> {
  return fetchV2<Plan[]>(
    `${BASE_PATH}/by_date${buildQuery({ date })}`,
    "getDayPlan",
  );
}

/**
 * 期間内の予定を日別エントリで取得する（GET /api/v2/plans/calendar）。
 *
 * 繰り返し（曜日）と単発（planned_on）は back が日付ごとに展開済みで返すため、
 * front では日付でグルーピングするだけでよい。
 *
 * 無料ユーザーの from / to は back が「今日 ±FREE_CALENDAR_WINDOW_MONTHS ヶ月」に
 * クランプする。範囲外を要求しても 403 ではなく 200 + クランプ後のエントリが返るので、
 * 「空だから予定が無い」と解釈してはいけない（呼び出し側で entitlement と突き合わせる）。
 *
 * @param from 期間開始日（YYYY-MM-DD）
 * @param to 期間終了日（YYYY-MM-DD）。from より前だと back が 422 を返し error になる。
 */
export async function getPlanCalendar(
  from: string,
  to: string,
): Promise<FetchResult<CalendarResponse>> {
  return fetchV2<CalendarResponse>(
    `${BASE_PATH}/calendar${buildQuery({ from, to })}`,
    "getPlanCalendar",
  );
}
