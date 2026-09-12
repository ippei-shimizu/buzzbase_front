import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import { extractMemoText } from "@app/utils/noteMemo";
import { tagLabel } from "@app/utils/noteTags";
import {
  type RecordSearchValues,
  EMPTY_RECORD_SEARCH,
  hasActiveRecordSearch,
  matchesDateRange,
  matchesKeyword,
  toDay,
} from "@app/utils/recordListFilter";

// back の GET /api/v2/baseball_notes は date / practice_log_id / practice_session_id /
// game_result_id / improvement_theme_id しか絞り込めず、全文検索・日付レンジ・タグ絞り込み・
// ページングのパラメータを持たない。そのため一覧側の検索と絞り込みは取得済みの
// レスポンスに対してクライアントで行う（日付レンジ・月分割は recordListFilter と共通）。

/** ノート一覧の絞り込み条件。すべて「空」が絞り込まないことを表す。 */
export interface NoteListFilterValues extends RecordSearchValues {
  /** 選択したタグ ID。複数選ぶと「すべて持つノート」に絞られる（AND）。 */
  tagIds: number[];
}

export const EMPTY_NOTE_FILTERS: NoteListFilterValues = {
  ...EMPTY_RECORD_SEARCH,
  tagIds: [],
};

/** 絞り込みが1つでも掛かっているか（クリアボタンの表示判定に使う）。 */
export function hasActiveNoteFilter(values: NoteListFilterValues): boolean {
  return hasActiveRecordSearch(values) || values.tagIds.length > 0;
}

/** ノートの日付（`YYYY-MM-DD`）。月の収集・抽出に渡す。 */
export function noteDate(note: BaseballNoteV2): string {
  return toDay(note.date);
}

/**
 * 検索対象のテキスト。本文は memo_preview（120文字で切り詰め済み）ではなく
 * memo 全文から抽出し、プレビューに載らない後半も検索できるようにする。
 * タグは `#` 付きでも打てるよう両方の表記を含める。
 */
function searchParts(note: BaseballNoteV2): string[] {
  const memoText = extractMemoText(note.memo) || note.memo_preview;
  const tagTexts = note.tags.flatMap((tag) => [tag.name, tagLabel(tag.name)]);
  return [note.title ?? "", memoText, ...tagTexts];
}

/**
 * 検索・日付レンジ・タグで絞り込む。
 *
 * 日付レンジは開始日・終了日ともに **その日を含む**。
 * タグは選択したものを **すべて** 持つノートだけを残す（AND）。
 */
export function filterNotes(
  notes: BaseballNoteV2[],
  values: NoteListFilterValues,
): BaseballNoteV2[] {
  return notes.filter((note) => {
    if (!matchesKeyword(searchParts(note), values.keyword)) return false;
    if (!matchesDateRange(note.date, values)) return false;
    if (values.tagIds.length > 0) {
      const noteTagIds = note.tags.map((tag) => tag.id);
      if (!values.tagIds.every((id) => noteTagIds.includes(id))) return false;
    }
    return true;
  });
}
