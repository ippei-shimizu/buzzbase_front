import type { BaseballNoteV2 } from "@app/interface/baseballNoteV2";
import { extractMemoText } from "@app/utils/noteMemo";
import { tagLabel } from "@app/utils/noteTags";

// back の GET /api/v2/baseball_notes は date / practice_log_id / practice_session_id /
// game_result_id / improvement_theme_id しか絞り込めず、全文検索・日付レンジ・タグ絞り込み・
// ページングのパラメータを持たない。そのため一覧側の検索と絞り込みは取得済みの
// レスポンスに対してクライアントで行う。

/** ノート一覧の絞り込み条件。すべて「空」が絞り込まないことを表す。 */
export interface NoteListFilterValues {
  /** タイトル / 本文 / タグを横断するフリーワード。 */
  keyword: string;
  /** 期間の開始日 `YYYY-MM-DD`。この日を含む。 */
  startDate: string;
  /** 期間の終了日 `YYYY-MM-DD`。この日を含む。 */
  endDate: string;
  /** 選択したタグ ID。複数選ぶと「すべて持つノート」に絞られる（AND）。 */
  tagIds: number[];
}

export const EMPTY_NOTE_FILTERS: NoteListFilterValues = {
  keyword: "",
  startDate: "",
  endDate: "",
  tagIds: [],
};

/** 絞り込みが1つでも掛かっているか（クリアボタンの表示判定に使う）。 */
export function hasActiveNoteFilter(values: NoteListFilterValues): boolean {
  return (
    values.keyword.trim() !== "" ||
    values.startDate !== "" ||
    values.endDate !== "" ||
    values.tagIds.length > 0
  );
}

/** `YYYY-MM-DD` 部分だけを取り出す（back が時刻付きで返した場合も比較できるようにする）。 */
function noteDay(note: BaseballNoteV2): string {
  return note.date.slice(0, 10);
}

/**
 * 検索対象のテキスト。本文は memo_preview（120文字で切り詰め済み）ではなく
 * memo 全文から抽出し、プレビューに載らない後半も検索できるようにする。
 * タグは `#` 付きでも打てるよう両方の表記を含める。
 */
function searchHaystack(note: BaseballNoteV2): string {
  const memoText = extractMemoText(note.memo) || note.memo_preview;
  const tagTexts = note.tags.flatMap((tag) => [tag.name, tagLabel(tag.name)]);
  return [note.title ?? "", memoText, ...tagTexts].join("\n").toLowerCase();
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
  const keyword = values.keyword.trim().toLowerCase();

  return notes.filter((note) => {
    if (keyword !== "" && !searchHaystack(note).includes(keyword)) return false;
    const day = noteDay(note);
    if (values.startDate !== "" && day < values.startDate) return false;
    if (values.endDate !== "" && day > values.endDate) return false;
    if (values.tagIds.length > 0) {
      const noteTagIds = note.tags.map((tag) => tag.id);
      if (!values.tagIds.every((id) => noteTagIds.includes(id))) return false;
    }
    return true;
  });
}

/** ノートが存在する年月（`YYYY-MM`）を新しい順に重複なく並べる。 */
export function collectNoteMonths(notes: BaseballNoteV2[]): string[] {
  const months = new Set(notes.map((note) => noteDay(note).slice(0, 7)));
  return Array.from(months).sort((a, b) => (a < b ? 1 : -1));
}

/** 指定した年月（`YYYY-MM`）のノートだけを取り出す。 */
export function notesInMonth(
  notes: BaseballNoteV2[],
  month: string,
): BaseballNoteV2[] {
  return notes.filter((note) => noteDay(note).startsWith(month));
}

/** `YYYY-MM` を「2026年8月」形式にする。 */
export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-");
  return `${Number(year)}年${Number(monthNumber)}月`;
}
