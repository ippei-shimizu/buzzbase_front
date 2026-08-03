"use server";

import type {
  ImprovementTheme,
  ImprovementThemeStatus,
} from "@app/types/improvementTheme";
import { type FetchResult, buildQuery, fetchV2 } from "./requests";

const BASE_PATH = "/api/v2/improvement_themes";

interface GetImprovementThemesParams {
  /** 取組状況で絞り込む。記録画面の紐付け候補は "open" のみを使う。 */
  status?: ImprovementThemeStatus;
}

/**
 * 課題一覧を取得する（GET /api/v2/improvement_themes）。
 * back 側で sort_order 昇順に並べて返る。
 */
export async function getImprovementThemes(
  params: GetImprovementThemesParams = {},
): Promise<FetchResult<ImprovementTheme[]>> {
  return fetchV2<ImprovementTheme[]>(
    `${BASE_PATH}${buildQuery({ status: params.status })}`,
    "getImprovementThemes",
  );
}
