import { upsertById } from "../upsertById";

describe("upsertById", () => {
  it("id が未登録なら先頭に追加する", () => {
    const items = [{ id: 1, name: "2025" }];

    expect(upsertById(items, { id: 2, name: "2026" })).toEqual([
      { id: 2, name: "2026" },
      { id: 1, name: "2025" },
    ]);
  });

  it("id が既にあれば重複させず置き換える", () => {
    const items = [
      { id: 1, name: "2025" },
      { id: 2, name: "2026" },
    ];

    expect(upsertById(items, { id: 2, name: "2026 春" })).toEqual([
      { id: 1, name: "2025" },
      { id: 2, name: "2026 春" },
    ]);
  });

  it("元の配列を変更しない", () => {
    const items = [{ id: 1, name: "2025" }];

    upsertById(items, { id: 2, name: "2026" });

    expect(items).toEqual([{ id: 1, name: "2025" }]);
  });
});
