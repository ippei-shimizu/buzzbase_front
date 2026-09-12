import type { BaseballNoteInput, NoteTag } from "@app/interface/baseballNoteV2";

/**
 * 表示用のタグ名。保存名には `#` を含めないため、表示のたびにここで付ける。
 * 既に `#` が付いた名前を渡されても `##` にならないよう先頭の `#` は落とす。
 */
export function tagLabel(name: string): string {
  return `#${stripHashPrefix(name)}`;
}

/**
 * 入力されたタグ名を保存名へ正規化する。
 * ユーザーが表示に合わせて `#` を打っても保存名には残さない（`#打撃` と `打撃` が
 * 別タグとして増えるのを防ぐ）。
 */
export function normalizeTagName(input: string): string {
  return stripHashPrefix(input.trim()).trim();
}

function stripHashPrefix(value: string): string {
  return value.replace(/^#+/, "");
}

/** 選択済み ID の集合から、表示順を保ったタグを取り出す。 */
export function selectedTags(tags: NoteTag[], ids: number[]): NoteTag[] {
  return tags.filter((tag) => ids.includes(tag.id));
}

interface TagPayloadParams {
  /**
   * タグを編集できるか。`note_tags` entitlement を持ち、かつ Pro 判定が確定している場合だけ true。
   * 判定中（未確定）に true を返してはならない。
   */
  canEditTags: boolean;
  tagIds: number[];
}

/**
 * 作成時に送る `tag_ids` を組み立てる。
 *
 * 無料ユーザー・Pro 判定が未確定のときは **キー自体を生やさない**。
 * back はタグ付与を Pro 限定として扱い、`tag_ids` が届くと Pro 判定に入る。
 * 空配列であっても送ってしまうと「タグを全解除する」意思表示になるため、
 * `undefined` を入れるのではなくキーごと落とす。
 */
export function buildTagIdsPayload({
  canEditTags,
  tagIds,
}: TagPayloadParams): Pick<BaseballNoteInput, "tag_ids"> {
  if (!canEditTags) return {};
  return { tag_ids: dedupe(tagIds) };
}

interface TagUpdateParams extends TagPayloadParams {
  /** 更新前にノートへ付いていたタグ ID。 */
  initialTagIds: number[];
}

/**
 * 更新時に送る `tag_ids` を組み立てる。
 *
 * 編集していない・編集できないときはキーを生やさない（back は未送信を「変更なし」として扱う）。
 * 全解除は `[]` を明示して送る。ここで `undefined` に丸めると解除が反映されない。
 */
export function buildTagIdsUpdate({
  canEditTags,
  initialTagIds,
  tagIds,
}: TagUpdateParams): Pick<BaseballNoteInput, "tag_ids"> {
  if (!canEditTags) return {};
  const next = dedupe(tagIds);
  if (isSameIdSet(next, dedupe(initialTagIds))) return {};
  return { tag_ids: next };
}

function dedupe(ids: number[]): number[] {
  return Array.from(new Set(ids));
}

/** 並び順は保存時に意味を持たないため、集合として比較する。 */
function isSameIdSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);
  return left.every((value, index) => value === right[index]);
}
