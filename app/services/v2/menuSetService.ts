"use server";

import type { MenuSet, MenuSetInput } from "@app/types/menuSet";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/menu_sets";

/** メニューセット一覧を取得する（GET /api/v2/menu_sets）。sort_order 昇順で返る。 */
export async function getMenuSets(): Promise<FetchResult<MenuSet[]>> {
  return fetchV2<MenuSet[]>(BASE_PATH, "getMenuSets");
}

/** メニューセットを1件取得する（GET /api/v2/menu_sets/:id）。他ユーザーのセットは 404。 */
export async function getMenuSet(id: number): Promise<FetchResult<MenuSet>> {
  return fetchV2<MenuSet>(`${BASE_PATH}/${id}`, "getMenuSet");
}

/**
 * メニューセットを新規作成する（POST /api/v2/menu_sets）。
 * 無料プランは MENU_SET_FREE_LIMIT 件を超えると 403 になる。
 * items に他ユーザーのメニューを混ぜても back 側で除外される（エラーにはならない）。
 */
export async function createMenuSet(
  input: MenuSetInput,
): Promise<MutationResult<MenuSet>> {
  return mutateV2<MenuSet>(BASE_PATH, {
    method: "POST",
    body: { menu_set: input },
    action: "createMenuSet",
    fallbackMessage: "メニューセットの作成に失敗しました",
  });
}

/**
 * メニューセットを更新する（PATCH /api/v2/menu_sets/:id）。
 * items を渡すとセット内メニューを全置換する。省略すると既存のまま維持される。
 */
export async function updateMenuSet(
  id: number,
  input: MenuSetInput,
): Promise<MutationResult<MenuSet>> {
  return mutateV2<MenuSet>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { menu_set: input },
    action: "updateMenuSet",
    fallbackMessage: "メニューセットの更新に失敗しました",
  });
}

/** メニューセットを削除する（DELETE /api/v2/menu_sets/:id）。 */
export async function deleteMenuSet(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteMenuSet",
    fallbackMessage: "メニューセットの削除に失敗しました",
  });
}
