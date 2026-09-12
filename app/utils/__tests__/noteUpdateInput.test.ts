import {
  buildNoteUpdateInput,
  hasNoteChanges,
  type NoteEditableFields,
} from "../noteUpdateInput";

const initial: NoteEditableFields = {
  date: "2026-08-01",
  title: "気づき",
  memo: '[{"type":"paragraph","children":[{"text":"外角"}]}]',
};

describe("buildNoteUpdateInput", () => {
  it("変更が無ければ空オブジェクトを返す", () => {
    expect(buildNoteUpdateInput(initial, { ...initial })).toEqual({});
  });

  it("変更したキーだけを含める", () => {
    const input = buildNoteUpdateInput(initial, {
      ...initial,
      title: "更新後",
    });
    expect(input).toEqual({ title: "更新後" });
    expect(Object.keys(input)).toEqual(["title"]);
  });

  it("日付とメモの変更をそれぞれ拾う", () => {
    expect(
      buildNoteUpdateInput(initial, { ...initial, date: "2026-08-02" }),
    ).toEqual({ date: "2026-08-02" });
    expect(buildNoteUpdateInput(initial, { ...initial, memo: "新" })).toEqual({
      memo: "新",
    });
  });

  it("タイトルを空にした場合は null を明示的に送る（未送信では消えないため）", () => {
    const input = buildNoteUpdateInput(initial, { ...initial, title: "" });
    expect(input).toEqual({ title: null });
  });

  it("テンプレ回答を変えたときだけ reflection_answers を送る", () => {
    const withAnswers: NoteEditableFields = {
      ...initial,
      reflectionAnswers: [{ question: "課題", answer: "引きつけ" }],
    };
    expect(buildNoteUpdateInput(withAnswers, { ...withAnswers })).toEqual({});
    expect(
      buildNoteUpdateInput(withAnswers, {
        ...withAnswers,
        reflectionAnswers: [{ question: "課題", answer: "体の開き" }],
      }),
    ).toEqual({
      reflection_answers: [{ question: "課題", answer: "体の開き" }],
    });
  });

  it("回答を全て消したときは空配列を明示して送る（未送信では消えないため）", () => {
    const withAnswers: NoteEditableFields = {
      ...initial,
      reflectionAnswers: [{ question: "課題", answer: "引きつけ" }],
    };
    expect(
      buildNoteUpdateInput(withAnswers, {
        ...withAnswers,
        reflectionAnswers: [],
      }),
    ).toEqual({ reflection_answers: [] });
  });

  it("回答を扱わない呼び出し元には reflection_answers キーを生やさない", () => {
    expect(
      buildNoteUpdateInput(initial, { ...initial, title: "更新後" }),
    ).not.toHaveProperty("reflection_answers");
  });

  it("紐付け・タグのキーは決して生やさない（既存の紐付けを消さない）", () => {
    const input = buildNoteUpdateInput(initial, {
      date: "2026-08-02",
      title: "更新後",
      memo: "新",
    });
    expect(input).not.toHaveProperty("game_result_ids");
    expect(input).not.toHaveProperty("improvement_theme_ids");
    expect(input).not.toHaveProperty("tag_ids");
    expect(input).not.toHaveProperty("reflection_template_id");
    expect(Object.keys(input).sort()).toEqual(["date", "memo", "title"]);
  });
});

describe("hasNoteChanges", () => {
  it("キーが1つでもあれば変更ありとみなす", () => {
    expect(hasNoteChanges({})).toBe(false);
    expect(hasNoteChanges({ title: null })).toBe(true);
    expect(hasNoteChanges({ game_result_ids: [] })).toBe(true);
  });
});
