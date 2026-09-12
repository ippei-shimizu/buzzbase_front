import type { BaseballNoteInput } from "@app/interface/baseballNoteV2";

interface LinkCapacityParams {
  /** 紐付けを追加した後の件数。 */
  nextCount: number;
  /**
   * 更新前にノートへ紐付いていた件数。新規作成は 0。
   * Pro 解約後も既存の複数紐付けを維持・削減できるようにするため（グランドファザリング）に使う。
   */
  initialCount: number;
  /** 複数紐付けの entitlement を持ち、かつ Pro 判定が確定しているか。未確定の間は false を渡す。 */
  hasMultiLink: boolean;
}

/**
 * その件数まで紐付けてよいか。
 *
 * back の `valid_game_results?` / `valid_improvement_themes?` と同じ判定にする。
 * back は「1件以下」「entitlement あり」「既存件数以下」のいずれかなら通し、
 * **既存件数を超えて2件以上に増やすときだけ** 403 を返す。
 * フロントで「無料は1件まで」と決め打ちすると、Pro 解約後のユーザーが既存の複数紐付けを
 * 維持したまま保存できなくなるため、必ず initialCount を見る。
 */
export function canLinkMore({
  nextCount,
  initialCount,
  hasMultiLink,
}: LinkCapacityParams): boolean {
  if (nextCount <= 1) return true;
  if (hasMultiLink) return true;
  return nextCount <= initialCount;
}

/**
 * 作成時に送る `improvement_theme_ids` を組み立てる。
 * 紐付けが無いときはキーを生やさない（back は blank を「紐付け無し」として扱う）。
 */
export function buildImprovementThemeIdsPayload(
  ids: number[],
): Pick<BaseballNoteInput, "improvement_theme_ids"> {
  const next = dedupe(ids);
  return next.length === 0 ? {} : { improvement_theme_ids: next };
}

/**
 * 作成時に送る `game_result_ids` を組み立てる。
 * 紐付けが無いときはキーを生やさない（back は blank を「紐付け無し」として扱う）。
 */
export function buildGameResultIdsPayload(
  ids: number[],
): Pick<BaseballNoteInput, "game_result_ids"> {
  const next = dedupe(ids);
  return next.length === 0 ? {} : { game_result_ids: next };
}

interface LinkUpdateParams {
  /** 更新前にノートへ紐付いていた ID。 */
  initialIds: number[];
  /** 画面で選択されている ID。 */
  ids: number[];
}

/**
 * 更新時に送る `game_result_ids` を組み立てる。
 *
 * 変更が無ければキーを生やさない（back は未送信を「変更なし」として扱う）。
 * 全解除は `[]` を明示して送る必要があるため、空配列をキー未送信へ丸めてはならない。
 */
export function buildGameResultIdsUpdate({
  initialIds,
  ids,
}: LinkUpdateParams): Pick<BaseballNoteInput, "game_result_ids"> {
  const changed = changedIds(initialIds, ids);
  return changed === null ? {} : { game_result_ids: changed };
}

/**
 * 更新時に送る `improvement_theme_ids` を組み立てる。
 * セマンティクスは `buildGameResultIdsUpdate` と同じ（未送信＝変更なし、`[]`＝全解除）。
 */
export function buildImprovementThemeIdsUpdate({
  initialIds,
  ids,
}: LinkUpdateParams): Pick<BaseballNoteInput, "improvement_theme_ids"> {
  const changed = changedIds(initialIds, ids);
  return changed === null ? {} : { improvement_theme_ids: changed };
}

/** 変更後の ID 配列。変更が無ければ null（キーを生やさないことを表す）。 */
function changedIds(initialIds: number[], ids: number[]): number[] | null {
  const next = dedupe(ids);
  return isSameIdSet(next, dedupe(initialIds)) ? null : next;
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
