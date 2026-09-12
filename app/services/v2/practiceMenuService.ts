"use server";

import type { PracticeMenu, PracticeMenuInput } from "@app/types/practice";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/practice_menus";

/**
 * 練習メニュー一覧を取得する（GET /api/v2/practice_menus）。
 * back 側で archived を除外し、お気に入り先頭・sort_order 昇順で返る。
 */
export async function getPracticeMenus(): Promise<FetchResult<PracticeMenu[]>> {
  return fetchV2<PracticeMenu[]>(BASE_PATH, "getPracticeMenus");
}

/**
 * 練習メニューを新規作成する（POST /api/v2/practice_menus）。
 * 無料プランは PRACTICE_MENU_FREE_LIMIT 件を超えると 403 になるため、
 * reason:"forbidden" を Pro 訴求の分岐に使う。
 */
export async function createPracticeMenu(
  input: PracticeMenuInput,
): Promise<MutationResult<PracticeMenu>> {
  return mutateV2<PracticeMenu>(BASE_PATH, {
    method: "POST",
    body: { practice_menu: input },
    action: "createPracticeMenu",
    fallbackMessage: "練習メニューの作成に失敗しました",
  });
}

/** 練習メニューを更新する（PATCH /api/v2/practice_menus/:id）。自分のメニューのみ更新可。 */
export async function updatePracticeMenu(
  id: number,
  input: Partial<PracticeMenuInput>,
): Promise<MutationResult<PracticeMenu>> {
  return mutateV2<PracticeMenu>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { practice_menu: input },
    action: "updatePracticeMenu",
    fallbackMessage: "練習メニューの更新に失敗しました",
  });
}

/**
 * 練習メニューを削除する（DELETE /api/v2/practice_menus/:id）。
 * back は履歴を残すため archived による論理削除を行う。
 */
export async function deletePracticeMenu(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deletePracticeMenu",
    fallbackMessage: "練習メニューの削除に失敗しました",
  });
}
