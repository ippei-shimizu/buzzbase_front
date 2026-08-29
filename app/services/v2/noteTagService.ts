"use server";

import type { NoteTag, NoteTagInput } from "@app/interface/baseballNoteV2";
import {
  type FetchResult,
  type MutationResult,
  fetchV2,
  mutateV2,
} from "./requests";

const BASE_PATH = "/api/v2/note_tags";

/**
 * ノートタグ一覧を取得する（GET /api/v2/note_tags）。
 * 運営プリセットと自分の自作タグが混在して返る（`is_preset` で区別する）。
 * 取得自体は無料ユーザーでも 200 で返り、付与だけが Pro 限定になる。
 */
export async function getNoteTags(): Promise<FetchResult<NoteTag[]>> {
  return fetchV2<NoteTag[]>(BASE_PATH, "getNoteTags");
}

/**
 * 自作タグを新規作成する（POST /api/v2/note_tags）。
 * 無料ユーザーは 403（reason:"forbidden"）、同名が既にある場合は 422 が返る。
 */
export async function createNoteTag(
  input: NoteTagInput,
): Promise<MutationResult<NoteTag>> {
  return mutateV2<NoteTag>(BASE_PATH, {
    method: "POST",
    body: { note_tag: input },
    action: "createNoteTag",
    fallbackMessage: "タグの作成に失敗しました",
  });
}
