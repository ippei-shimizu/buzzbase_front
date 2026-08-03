import type { BaseballNoteV2, NoteTag } from "@app/interface/baseballNoteV2";
import {
  EMPTY_NOTE_FILTERS,
  filterNotes,
  hasActiveNoteFilter,
  noteDate,
} from "@app/utils/noteListFilter";
import { buildMemoJson } from "@app/utils/noteMemo";
import {
  collectMonths,
  formatMonthLabel,
  itemsInMonth,
} from "@app/utils/recordListFilter";

const battingTag: NoteTag = { id: 1, name: "打撃", is_preset: true };
const mentalTag: NoteTag = { id: 2, name: "メンタル", is_preset: false };

function buildNote(overrides: Partial<BaseballNoteV2> = {}): BaseballNoteV2 {
  return {
    id: 1,
    title: "気づき",
    date: "2026-08-10",
    memo: buildMemoJson("外角が詰まる"),
    memo_preview: "外角が詰まる",
    game_result_ids: [],
    practice_log_id: null,
    practice_session_id: null,
    improvement_theme_ids: [],
    reflection_template_id: null,
    reflection_answers: [],
    tags: [],
    media_attachments: [],
    ...overrides,
  };
}

describe("hasActiveNoteFilter", () => {
  it("何も絞り込んでいなければ false", () => {
    expect(hasActiveNoteFilter(EMPTY_NOTE_FILTERS)).toBe(false);
  });

  it("空白だけのキーワードは絞り込みとみなさない", () => {
    expect(hasActiveNoteFilter({ ...EMPTY_NOTE_FILTERS, keyword: "   " })).toBe(
      false,
    );
  });

  it.each([
    ["キーワード", { keyword: "外角" }],
    ["開始日", { startDate: "2026-08-01" }],
    ["終了日", { endDate: "2026-08-31" }],
    ["タグ", { tagIds: [1] }],
  ])("%s が入っていれば true", (_label, values) => {
    expect(hasActiveNoteFilter({ ...EMPTY_NOTE_FILTERS, ...values })).toBe(
      true,
    );
  });
});

describe("filterNotes（検索）", () => {
  const notes = [
    buildNote({
      id: 1,
      title: "打撃の気づき",
      memo: buildMemoJson("体の開き"),
    }),
    buildNote({ id: 2, title: "守備", memo: buildMemoJson("一歩目が遅い") }),
    buildNote({ id: 3, title: "メモなし", memo: null, tags: [mentalTag] }),
  ];

  it("タイトルを横断して検索する", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      keyword: "守備",
    });

    expect(result.map((note) => note.id)).toEqual([2]);
  });

  it("本文を横断して検索する", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      keyword: "一歩目",
    });

    expect(result.map((note) => note.id)).toEqual([2]);
  });

  it("タグ名を横断して検索する（# 付きでも引ける）", () => {
    expect(
      filterNotes(notes, { ...EMPTY_NOTE_FILTERS, keyword: "メンタル" }).map(
        (note) => note.id,
      ),
    ).toEqual([3]);
    expect(
      filterNotes(notes, { ...EMPTY_NOTE_FILTERS, keyword: "#メンタル" }).map(
        (note) => note.id,
      ),
    ).toEqual([3]);
  });

  it("memo_preview に載らない本文後半も検索できる", () => {
    const longNote = buildNote({
      id: 9,
      title: "長文",
      memo: buildMemoJson(`${"あ".repeat(200)}最後の一行`),
      memo_preview: "あ".repeat(120),
    });

    expect(
      filterNotes([longNote], {
        ...EMPTY_NOTE_FILTERS,
        keyword: "最後の一行",
      }),
    ).toHaveLength(1);
  });

  it("一致しなければ空配列（0件）を返す", () => {
    expect(
      filterNotes(notes, { ...EMPTY_NOTE_FILTERS, keyword: "存在しない語" }),
    ).toEqual([]);
  });
});

describe("filterNotes（日付レンジ）", () => {
  const notes = [
    buildNote({ id: 1, date: "2026-07-31" }),
    buildNote({ id: 2, date: "2026-08-01" }),
    buildNote({ id: 3, date: "2026-08-31" }),
    buildNote({ id: 4, date: "2026-09-01" }),
  ];

  it("開始日はその日を含む", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      startDate: "2026-08-01",
    });

    expect(result.map((note) => note.id)).toEqual([2, 3, 4]);
  });

  it("終了日はその日を含む", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      endDate: "2026-08-31",
    });

    expect(result.map((note) => note.id)).toEqual([1, 2, 3]);
  });

  it("開始日と終了日の両端を含んで絞り込む", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });

    expect(result.map((note) => note.id)).toEqual([2, 3]);
  });
});

describe("filterNotes（タグ）", () => {
  const notes = [
    buildNote({ id: 1, tags: [battingTag] }),
    buildNote({ id: 2, tags: [battingTag, mentalTag] }),
    buildNote({ id: 3, tags: [] }),
  ];

  it("1つ選ぶとそのタグを持つノートに絞られる", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      tagIds: [battingTag.id],
    });

    expect(result.map((note) => note.id)).toEqual([1, 2]);
  });

  it("複数選ぶと全て持つノートだけに絞られる（AND）", () => {
    const result = filterNotes(notes, {
      ...EMPTY_NOTE_FILTERS,
      tagIds: [battingTag.id, mentalTag.id],
    });

    expect(result.map((note) => note.id)).toEqual([2]);
  });
});

describe("月次ページングの補助", () => {
  const notes = [
    buildNote({ id: 1, date: "2026-08-10" }),
    buildNote({ id: 2, date: "2026-06-02" }),
    buildNote({ id: 3, date: "2026-08-01" }),
  ];

  it("ノートのある年月を新しい順に重複なく並べる", () => {
    expect(collectMonths(notes, noteDate)).toEqual(["2026-08", "2026-06"]);
  });

  it("指定した年月のノートだけを取り出す", () => {
    expect(
      itemsInMonth(notes, noteDate, "2026-08").map((note) => note.id),
    ).toEqual([1, 3]);
  });

  it("年月を日本語表記にする", () => {
    expect(formatMonthLabel("2026-08")).toBe("2026年8月");
  });
});
