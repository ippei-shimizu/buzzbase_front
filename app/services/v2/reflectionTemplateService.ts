"use server";

import type {
  ReflectionTemplate,
  ReflectionTemplateInput,
} from "@app/interface/reflectionTemplate";
import {
  type DeletedResponse,
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/reflection_templates";

/**
 * 振り返りテンプレ一覧を取得する（GET /api/v2/reflection_templates）。
 * プリセットと自分の自作テンプレが混在して返る（`is_preset` で区別する）。
 * 自分がプリセットを編集済みの場合、そのプリセットは返らずコピーだけが返る。
 */
export async function getReflectionTemplates(): Promise<
  FetchResult<ReflectionTemplate[]>
> {
  return fetchV2<ReflectionTemplate[]>(BASE_PATH, "getReflectionTemplates");
}

/**
 * 自作テンプレを新規作成する（POST /api/v2/reflection_templates）。
 * 無料プランは自作が REFLECTION_TEMPLATE_FREE_LIMIT 件を超えると 403 になるため、
 * reason:"forbidden" を Pro 訴求の分岐に使う。
 */
export async function createReflectionTemplate(
  input: ReflectionTemplateInput,
): Promise<MutationResult<ReflectionTemplate>> {
  return mutateV2<ReflectionTemplate>(BASE_PATH, {
    method: "POST",
    body: { reflection_template: input },
    action: "createReflectionTemplate",
    fallbackMessage: "振り返りテンプレの作成に失敗しました",
  });
}

/**
 * テンプレを更新する（PATCH /api/v2/reflection_templates/:id）。
 *
 * back は原本を書き換えず「新しいバージョン」を別レコードとして作り、それを返す
 * （過去ノートが参照する原本を壊さないため）。したがって **返り値の id は渡した id と異なる**。
 * 呼び出し側は必ず返却された新しいテンプレで手元の状態を差し替えること。
 * プリセットを編集した場合は自作テンプレの新規作成に等しいため、無料枠を使い切っていると 403 になる。
 */
export async function updateReflectionTemplate(
  id: number,
  input: ReflectionTemplateInput,
): Promise<MutationResult<ReflectionTemplate>> {
  return mutateV2<ReflectionTemplate>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: { reflection_template: input },
    action: "updateReflectionTemplate",
    fallbackMessage: "振り返りテンプレの更新に失敗しました",
  });
}

/**
 * 自作テンプレを削除する（DELETE /api/v2/reflection_templates/:id）。
 * 野球ノートで使用中のテンプレは参照整合性のため 422 で拒否され、理由が errors に入る。
 */
export async function deleteReflectionTemplate(
  id: number,
): Promise<MutationResult<DeletedResponse>> {
  return mutateV2<DeletedResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    action: "deleteReflectionTemplate",
    fallbackMessage: "振り返りテンプレの削除に失敗しました",
  });
}
