"use server";

import type { CalendarResponse } from "@app/types/plan";
import { type FetchResult, buildQuery, fetchV2 } from "./requests";

const BASE_PATH = "/api/v2/plans";

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
