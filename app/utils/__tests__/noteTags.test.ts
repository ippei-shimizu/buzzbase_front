import {
  buildTagIdsPayload,
  buildTagIdsUpdate,
  normalizeTagName,
  selectedTags,
  tagLabel,
} from "@app/utils/noteTags";

describe("tagLabel", () => {
  it("表示名には # を付ける", () => {
    expect(tagLabel("打撃")).toBe("#打撃");
  });

  it("既に # が付いた名前でも ## にしない", () => {
    expect(tagLabel("#打撃")).toBe("#打撃");
  });
});

describe("normalizeTagName", () => {
  it("保存名には # を含めない", () => {
    expect(normalizeTagName("#打撃")).toBe("打撃");
  });

  it("複数の # と前後の空白を落とす", () => {
    expect(normalizeTagName("  ##  打撃  ")).toBe("打撃");
  });

  it("名前の途中の # は残す", () => {
    expect(normalizeTagName("打撃#メモ")).toBe("打撃#メモ");
  });

  it("# だけの入力は空になる", () => {
    expect(normalizeTagName("###")).toBe("");
  });
});

describe("selectedTags", () => {
  const tags = [
    { id: 1, name: "打撃", is_preset: true },
    { id: 2, name: "守備", is_preset: true },
  ];

  it("選択された ID のタグだけを表示順のまま返す", () => {
    expect(selectedTags(tags, [2])).toEqual([tags[1]]);
  });
});

describe("buildTagIdsPayload（作成時）", () => {
  it("編集できない（無料 / 判定未確定）ときは値があっても tag_ids キーを生やさない", () => {
    const payload = buildTagIdsPayload({ canEditTags: false, tagIds: [1, 2] });

    expect(payload).toEqual({});
    expect("tag_ids" in payload).toBe(false);
  });

  it("編集できるときは選択したタグを送る", () => {
    expect(buildTagIdsPayload({ canEditTags: true, tagIds: [1, 2] })).toEqual({
      tag_ids: [1, 2],
    });
  });

  it("編集できるなら未選択でも空配列を送る", () => {
    const payload = buildTagIdsPayload({ canEditTags: true, tagIds: [] });

    expect(payload).toEqual({ tag_ids: [] });
    expect("tag_ids" in payload).toBe(true);
  });

  it("重複した ID は 1 つにまとめる", () => {
    expect(
      buildTagIdsPayload({ canEditTags: true, tagIds: [1, 1, 2] }),
    ).toEqual({ tag_ids: [1, 2] });
  });
});

describe("buildTagIdsUpdate（更新時）", () => {
  it("編集できないときは選択が変わっていても tag_ids キーを生やさない", () => {
    const payload = buildTagIdsUpdate({
      canEditTags: false,
      initialTagIds: [1],
      tagIds: [1, 2],
    });

    expect(payload).toEqual({});
    expect("tag_ids" in payload).toBe(false);
  });

  it("編集できないときは全解除の操作をしても tag_ids キーを生やさない", () => {
    expect(
      buildTagIdsUpdate({
        canEditTags: false,
        initialTagIds: [1, 2],
        tagIds: [],
      }),
    ).toEqual({});
  });

  it("選択が変わっていなければキーを生やさない", () => {
    expect(
      buildTagIdsUpdate({
        canEditTags: true,
        initialTagIds: [1, 2],
        tagIds: [2, 1],
      }),
    ).toEqual({});
  });

  it("選択を変えたら新しい ID を送る", () => {
    expect(
      buildTagIdsUpdate({
        canEditTags: true,
        initialTagIds: [1],
        tagIds: [3],
      }),
    ).toEqual({ tag_ids: [3] });
  });

  it("全解除は空配列を明示して送る", () => {
    const payload = buildTagIdsUpdate({
      canEditTags: true,
      initialTagIds: [1, 2],
      tagIds: [],
    });

    expect(payload).toEqual({ tag_ids: [] });
    expect("tag_ids" in payload).toBe(true);
  });
});
