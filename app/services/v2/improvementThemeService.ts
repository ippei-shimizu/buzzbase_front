"use server";

import type {
  ImprovementTheme,
  ImprovementThemeInput,
  ImprovementThemeStatus,
} from "@app/types/improvementTheme";
import { revalidatePath } from "next/cache";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  buildQuery,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/improvement_themes";

interface GetImprovementThemesParams {
  /** 取組状況で絞り込む。記録画面の紐付け候補は "open" のみを使う。 */
  status?: ImprovementThemeStatus;
}

/** 課題一覧・詳細を表示する画面の再検証。作成・更新・削除の後に呼ぶ。 */
async function revalidateThemes(id?: number): Promise<void> {
  revalidatePath("/themes");
  if (id) revalidatePath(`/themes/${id}`);
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

/**
 * 課題を新規作成する（POST /api/v2/improvement_themes）。
 * 無料プランは取組中（open）が IMPROVEMENT_THEME_FREE_LIMIT 件を超えると 403 になるため、
 * reason:"forbidden" を Pro 訴求の分岐に使う。
 */
export async function createImprovementTheme(
  input: ImprovementThemeInput,
): Promise<MutationResult<ImprovementTheme>> {
  const result = await mutateV2<ImprovementTheme>(BASE_PATH, {
    method: "POST",
    body: { improvement_theme: input },
    action: "createImprovementTheme",
    fallbackMessage: "課題の作成に失敗しました",
  });
  if (result.ok) await revalidateThemes();
  return result;
}

/**
 * 課題を更新する（PATCH /api/v2/improvement_themes/:id）。
 * 状態遷移（克服 / 取組中へ戻す / アーカイブ）もこのエンドポイントで行う。
 * back に遷移の制約は無く、送った status がそのまま保存される。
 */
export async function updateImprovementTheme(
  id: number,
  input: ImprovementThemeInput,
): Promise<MutationResult<ImprovementTheme>> {
  const result = await mutateV2<ImprovementTheme>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { improvement_theme: input },
    action: "updateImprovementTheme",
    fallbackMessage: "課題の更新に失敗しました",
  });
  if (result.ok) await revalidateThemes(id);
  return result;
}

/**
 * 課題を削除する（DELETE /api/v2/improvement_themes/:id）。
 * 紐付いていた練習・ノートは中間テーブルごと外れるだけで、記録自体は残る。
 */
export async function deleteImprovementTheme(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  const result = await mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteImprovementTheme",
    fallbackMessage: "課題の削除に失敗しました",
  });
  if (result.ok) await revalidateThemes(id);
  return result;
}
