import {
  buildMemoJson,
  buildReflectionMemoText,
  extractMemoText,
  isReflectionMemo,
  parseMemoToSlateValue,
} from "../noteMemo";

describe("buildMemoJson / extractMemoText", () => {
  it("プレーンテキストを Slate 互換 JSON にする", () => {
    expect(buildMemoJson("外角が詰まる")).toBe(
      '[{"type":"paragraph","children":[{"text":"外角が詰まる"}]}]',
    );
  });

  it("buildMemoJson → extractMemoText で本文が復元できる（改行込み）", () => {
    const text = "1行目\n2行目\n\n4行目";
    expect(extractMemoText(buildMemoJson(text))).toBe(text);
  });

  it("複数段落は改行で連結する", () => {
    const memo = JSON.stringify([
      { type: "paragraph", children: [{ text: "上" }] },
      { type: "paragraph", children: [{ text: "下" }] },
    ]);
    expect(extractMemoText(memo)).toBe("上\n下");
  });

  it("同一段落内の複数テキストノードは連結する", () => {
    const memo = JSON.stringify([
      { type: "paragraph", children: [{ text: "外角" }, { text: "が詰まる" }] },
    ]);
    expect(extractMemoText(memo)).toBe("外角が詰まる");
  });

  it("null / undefined / 空文字は空文字を返す", () => {
    expect(extractMemoText(null)).toBe("");
    expect(extractMemoText(undefined)).toBe("");
    expect(extractMemoText("")).toBe("");
  });

  it("壊れた JSON はそのまま本文として扱う（例外を投げない）", () => {
    expect(extractMemoText('[{"type":"paragraph"')).toBe(
      '[{"type":"paragraph"',
    );
  });

  it("v1 のプレーンテキストはそのまま返す", () => {
    expect(extractMemoText("素振り30分")).toBe("素振り30分");
  });

  it("JSON として読めるが構造が想定外でも例外を投げない", () => {
    expect(extractMemoText("123")).toBe("123");
    expect(extractMemoText('{"memo":"x"}')).toBe('{"memo":"x"}');
    expect(extractMemoText('[{"type":"paragraph"}]')).toBe(
      '[{"type":"paragraph"}]',
    );
  });

  it("空配列 JSON は空文字になる", () => {
    expect(extractMemoText("[]")).toBe("");
  });
});

describe("buildReflectionMemoText / isReflectionMemo", () => {
  const answers = [
    { question: "うまくいったこと", answer: "外角を捌けた" },
    { question: "次やること", answer: "引きつけ" },
  ];

  it("問いを【】で囲み、回答間を空行で区切る", () => {
    expect(buildReflectionMemoText(answers)).toBe(
      "【うまくいったこと】\n外角を捌けた\n\n【次やること】\n引きつけ",
    );
  });

  it("回答が無ければ空文字", () => {
    expect(buildReflectionMemoText([])).toBe("");
  });

  it("合成メモ（新フォーマット）を判定できる", () => {
    expect(isReflectionMemo(buildReflectionMemoText(answers), answers)).toBe(
      true,
    );
  });

  it("合成メモ（旧フォーマット: 問い: 回答）も判定できる", () => {
    const legacy = "うまくいったこと: 外角を捌けた\n次やること: 引きつけ";
    expect(isReflectionMemo(legacy, answers)).toBe(true);
  });

  it("自由入力メモは合成メモと判定しない", () => {
    expect(isReflectionMemo("今日は調子が良かった", answers)).toBe(false);
  });

  it("回答が無いノートは常に false", () => {
    expect(isReflectionMemo("", [])).toBe(false);
  });
});

describe("parseMemoToSlateValue", () => {
  it("Slate JSON をそのまま段落として復元する", () => {
    const memo = JSON.stringify([
      { type: "paragraph", children: [{ text: "上" }] },
      { type: "paragraph", children: [{ text: "下" }] },
    ]);
    expect(parseMemoToSlateValue(memo)).toEqual([
      { type: "paragraph", children: [{ text: "上" }] },
      { type: "paragraph", children: [{ text: "下" }] },
    ]);
  });

  it("空 memo は空段落 1 つを返す", () => {
    expect(parseMemoToSlateValue("")).toEqual([
      { type: "paragraph", children: [{ text: "" }] },
    ]);
    expect(parseMemoToSlateValue(null)).toEqual([
      { type: "paragraph", children: [{ text: "" }] },
    ]);
  });

  it("v1 のプレーンテキストは行ごとの段落に変換する", () => {
    expect(parseMemoToSlateValue("1行目\n2行目")).toEqual([
      { type: "paragraph", children: [{ text: "1行目" }] },
      { type: "paragraph", children: [{ text: "2行目" }] },
    ]);
  });

  it("壊れた JSON でも例外を投げず段落に落とす", () => {
    expect(parseMemoToSlateValue('[{"children":')).toEqual([
      { type: "paragraph", children: [{ text: '[{"children":' }] },
    ]);
  });

  it("children を欠く JSON は段落として採用しない", () => {
    const memo = '[{"type":"paragraph"}]';
    expect(parseMemoToSlateValue(memo)).toEqual([
      { type: "paragraph", children: [{ text: memo }] },
    ]);
  });

  it("空配列 JSON は空段落を返さずテキストとして扱う", () => {
    expect(parseMemoToSlateValue("[]")).toEqual([
      { type: "paragraph", children: [{ text: "[]" }] },
    ]);
  });

  it("text が文字列でないノードは段落として採用しない", () => {
    const memo = '[{"type":"paragraph","children":[{"text":1}]}]';
    expect(parseMemoToSlateValue(memo)).toEqual([
      { type: "paragraph", children: [{ text: memo }] },
    ]);
  });

  it("buildMemoJson の出力は正規化しても同じ JSON に戻る（無変更が変更扱いにならない）", () => {
    const memo = buildMemoJson("外角が詰まる");
    expect(JSON.stringify(parseMemoToSlateValue(memo))).toBe(memo);
  });
});
