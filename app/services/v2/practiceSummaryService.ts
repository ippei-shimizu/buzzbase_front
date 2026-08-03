"use server";

import type {
  MenuSummary,
  MenuTrend,
  PracticeOverview,
} from "@app/types/practice";
import { type FetchResult, fetchV2 } from "./requests";

/**
 * メニュー別の積み上げサマリーを取得する（GET /api/v2/practice_menu_summaries）。
 * 直近に記録したメニュー順で返る。記録が無ければ空配列（status:"ok"）。
 */
export async function getMenuSummaries(): Promise<FetchResult<MenuSummary[]>> {
  return fetchV2<MenuSummary[]>(
    "/api/v2/practice_menu_summaries",
    "getMenuSummaries",
  );
}

/** 練習全体の KPI を取得する（GET /api/v2/practice_overview）。 */
export async function getPracticeOverview(): Promise<
  FetchResult<PracticeOverview>
> {
  return fetchV2<PracticeOverview>(
    "/api/v2/practice_overview",
    "getPracticeOverview",
  );
}

/**
 * 単一メニューの推移を取得する（GET /api/v2/practice_menu_trends/:id）。
 * 推移詳細は Pro 限定（entitlement: practice_menu_trend_detail）のため、
 * 無料プランでは status:"forbidden" が返る。
 *
 * @param menuId practice_menu の id
 */
export async function getMenuTrend(
  menuId: number,
): Promise<FetchResult<MenuTrend>> {
  return fetchV2<MenuTrend>(
    `/api/v2/practice_menu_trends/${menuId}`,
    "getMenuTrend",
  );
}
